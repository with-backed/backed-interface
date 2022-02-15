import { NextApiRequest, NextApiResponse } from 'next';
import {
  createNotificationRequestForAddress,
  deleteAllNotificationRequestsForAddress,
} from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  NotificationReqBody,
  NotificationMethod,
  NotificationEventTrigger,
} from 'lib/notifications/shared';
import { generateAddressFromSignedMessage } from 'lib/signedMessages';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | string>,
) {
  if (req.method != 'POST' && req.method != 'DELETE') {
    res.status(405).send('Only POST or DELETE requests allowed');
    return;
  }

  try {
    const { address, email } = req.query;
    const { signedMessage } = req.body as NotificationReqBody;

    const addressFromSig = generateAddressFromSignedMessage(signedMessage);
    const addressFromQuery = ethers.utils.getAddress(address as string);
    const destination = email as string;
    const method = NotificationMethod.EMAIL;

    if (!addressFromSig) {
      res.status(400).json('invalid signature sent');
      return;
    }

    if (ethers.utils.getAddress(addressFromSig) != addressFromQuery) {
      res.status(400).json('valid signature sent with mismatching addresses');
      return;
    }

    if (req.method == 'POST') {
      const notificationRequest = await createNotificationRequestForAddress(
        addressFromQuery,
        NotificationEventTrigger.ALL,
        method,
        destination,
      );
      if (!notificationRequest) {
        res.status(400).json('unexpected error creating notification request');
        return;
      }
      res.status(200).json(notificationRequest);
    } else if (req.method == 'DELETE') {
      const deleteNotificationRequestsRes =
        await deleteAllNotificationRequestsForAddress(addressFromQuery);
      if (!deleteNotificationRequestsRes) {
        res.status(400).json('unexpected error deleting notification requests');
        return;
      }
      res
        .status(200)
        .json(
          `notifications for address ${addressFromQuery} deleted successfully`,
        );
    }
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
