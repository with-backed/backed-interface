import { ethers } from 'ethers';

export const timestampFromEvent = async (
  event: ethers.Event,
): Promise<number> => {
  const { timestamp } = await event.getBlock();
  return timestamp;
};
