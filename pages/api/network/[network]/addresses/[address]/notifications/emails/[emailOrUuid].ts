import { NextApiRequest, NextApiResponse } from 'next';
import {
  createNotificationRequestForAddress,
  deleteNotificationRequestById,
  getNumberOfRequestsForNotificationDestination,
} from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import { NotificationMethod } from 'lib/events/consumers/userNotifications/shared';
import { APIErrorMessage } from 'pages/api/sharedTypes';
import { captureException, withSentry } from '@sentry/nextjs';
import { sendConfirmationEmail } from 'lib/events/consumers/userNotifications/emails/emails';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

const MAX_ADDRESSES_PER_NOTIFICATION_DESTINATION = 5;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | APIErrorMessage>,
) {
  if (req.method != 'POST' && req.method != 'DELETE') {
    res.status(405).json({ message: 'Only POST or DELETE requests allowed' });
    return;
  }

  // this endpoint takes an email if POST (i.e. subscribing to an ethAddresses activity)
  // this endpoint takes a UUID if DELETE (i.e. unsubscribing a particular email <> ethAddress pair)
  try {
    validateNetwork(req.query);
    const { address, emailOrUuid, network } = req.query as {
      address: string;
      emailOrUuid: string;
      network: SupportedNetwork;
    };

    const config = configs[network];

    if (req.method == 'POST') {
      const destination = emailOrUuid as string;
      const method = NotificationMethod.EMAIL;

      const numRequestsForEmail =
        await getNumberOfRequestsForNotificationDestination(destination);
      if (numRequestsForEmail === null) {
        res
          .status(400)
          .json({ message: 'unexpected error creating notification request' });
        return;
      }

      if (numRequestsForEmail > MAX_ADDRESSES_PER_NOTIFICATION_DESTINATION) {
        res.status(400).json({
          message: `you can only subscribe to ${MAX_ADDRESSES_PER_NOTIFICATION_DESTINATION} addresses per email address`,
        });
        return;
      }

      const notificationRequest = await createNotificationRequestForAddress(
        address,
        'All',
        method,
        destination,
      );
      if (!notificationRequest) {
        res.status(400).json({
          message: 'unexpected error creating notification request',
        });
        return;
      }

      await sendConfirmationEmail(
        destination,
        address,
        notificationRequest.id,
        config.siteUrl,
        config.jsonRpcProvider,
      );

      res.status(200).json(notificationRequest);
    } else if (req.method == 'DELETE') {
      const deleteNotificationRequestsRes = await deleteNotificationRequestById(
        emailOrUuid,
      );
      if (!deleteNotificationRequestsRes) {
        res.status(400).json({
          message: 'unexpected error deleting notification requests',
        });
        return;
      }
      res.status(200).json({
        message: `notification request with uuid ${emailOrUuid} deleted successfully`,
      });
    }
  } catch (e) {
    captureException(e);
  }
}

export default withSentry(handler);
