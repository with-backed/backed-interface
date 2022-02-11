import { NextApiRequest, NextApiResponse } from 'next';
import { createNotificationRequestForAddress } from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';
import { CreateNotificationReqBody } from 'lib/notifications/shared';
import {
  bufferToHex,
  ecrecover,
  fromRpcSig,
  pubToAddress,
  toBuffer,
  keccak,
} from 'ethereumjs-util';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationRequest | string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { address, method, destination, signedMessage } =
      req.body as CreateNotificationReqBody;

    const addressFromSig = generateAddressFromSignedMessage(signedMessage);

    if (addressFromSig == '') {
      res.status(400).json('invalid signature sent');
      return;
    }

    if (addressFromSig.toLowerCase() != address.toLowerCase()) {
      res.status(400).json('valid signature sent with mismatching addresses');
      return;
    }

    const createdNotificationRequest =
      await createNotificationRequestForAddress(
        address.toLowerCase(),
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

function generateAddressFromSignedMessage(signedMessage: string): string {
  try {
    const address = ethers.utils.verifyMessage(
      process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!,
      signedMessage,
    );
    return address;
  } catch (_e) {
    return '';
  }
}
