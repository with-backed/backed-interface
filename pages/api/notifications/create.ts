import { NextApiRequest, NextApiResponse } from 'next';
import {
  createNotificationRequestForAddress,
  NotificationMethod,
} from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { address, method, destination } = req.body;

    const createdNotificationRequest =
      await createNotificationRequestForAddress(
        address,
        '',
        method as NotificationMethod,
        destination,
      );

    if (!createdNotificationRequest) {
      res.status(400).json('unexpected error creating notification request');
      return;
    }

    res.status(200).json(createdNotificationRequest);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
