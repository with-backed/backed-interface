import { NextApiRequest, NextApiResponse } from 'next';
import { deleteAllNotificationRequestsForAddress } from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';
import { CreateNotificationReqBody } from 'lib/notifications/shared';
import { generateAddressFromSignedMessage } from 'lib/signedMessages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | string>,
) {
  if (req.method != 'DELETE') {
    res.status(405).send('Only DELETE requests allowed');
    return;
  }

  try {
    const { address, signedMessage } = req.body as CreateNotificationReqBody;

    const addressFromSig = generateAddressFromSignedMessage(signedMessage);

    if (!addressFromSig) {
      res.status(400).json('invalid signature sent');
      return;
    }

    if (addressFromSig.toLowerCase() != address.toLowerCase()) {
      res.status(400).json('valid signature sent with mismatching addresses');
      return;
    }

    const deleteNotificationRequestsRes =
      await deleteAllNotificationRequestsForAddress(address.toLowerCase());

    if (!deleteNotificationRequestsRes) {
      res.status(400).json('unexpected error deleting notification requests');
      return;
    }

    res
      .status(200)
      .json(`notifications for address ${address} deleted successfully`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
