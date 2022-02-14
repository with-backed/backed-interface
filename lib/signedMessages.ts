import { ethers } from 'ethers';

export function generateAddressFromSignedMessage(
  signedMessage: string,
): string | null {
  try {
    const address = ethers.utils.verifyMessage(
      process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!,
      signedMessage,
    );
    return address;
  } catch (_e) {
    return null;
  }
}
