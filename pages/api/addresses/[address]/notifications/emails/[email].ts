import { NextApiRequest, NextApiResponse } from 'next';
import {
  createNotificationRequestForAddress,
  deleteAllNotificationRequestsForAddress,
  getNumberOfRequestsForNotificationDestination,
} from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import { NotificationMethod } from 'lib/events/consumers/userNotifications/shared';
import { APIErrorMessage } from 'pages/api/sharedTypes';

const MAX_ADDRESSES_PER_NOTIFICATION_DESTINATION = 5;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | APIErrorMessage>,
) {
  if (req.method != 'POST' && req.method != 'DELETE') {
    res.status(405).json({ message: 'Only POST or DELETE requests allowed' });
    return;
  }

  try {
    const { address, email } = req.query as { address: string; email: string };

    const destination = email as string;
    const method = NotificationMethod.EMAIL;

    if (req.method == 'POST') {
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

      res.status(200).json(notificationRequest);
    } else if (req.method == 'DELETE') {
      const deleteNotificationRequestsRes =
        await deleteAllNotificationRequestsForAddress(address);
      if (!deleteNotificationRequestsRes) {
        res.status(400).json({
          message: 'unexpected error deleting notification requests',
        });
        return;
      }
      res.status(200).json({
        message: `notifications for address ${address} deleted successfully`,
      });
    }
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
