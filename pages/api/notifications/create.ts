import { NextApiRequest, NextApiResponse } from 'next';
import { createNotificationRequestForAddress } from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  CreateNotificationReqBody,
  NotificationMethod,
} from 'lib/notifications/shared';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { address, method, destination } =
      req.body as CreateNotificationReqBody;

    const createdNotificationRequest =
      await createNotificationRequestForAddress(
        address,
        '',
        method,
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
