import { NextApiRequest, NextApiResponse } from 'next';
import { createNotificationRequestForAddress } from 'lib/notifications/repository';
import { NotificationRequest } from '@prisma/client';
import { CreateNotificationReqBody } from 'lib/notifications/shared';
import util from 'ethereumjs-util';

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

    if (addressFromSig.toLowerCase() != address.toLowerCase()) {
      res.status(400).json('invalid signature sent with request');
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
  const msg: Buffer = Buffer.from(
    process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!,
  );

  const prefix = Buffer.from('\x19Ethereum Signed Message:\n');
  const prefixedMsg = util.keccak256(
    Buffer.concat([prefix, Buffer.from(String(msg.length)), msg]),
  );

  const resSig = util.fromRpcSig(signedMessage);
  const pubKey = util.ecrecover(prefixedMsg, resSig.v, resSig.r, resSig.s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);

  return addr;
}
