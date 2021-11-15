import { ethers } from 'ethers';

const SECONDS_IN_DAY = 60 * 60 * 24;

export function secondsToDays(seconds: number) {
  return seconds / SECONDS_IN_DAY;
}

export function secondsBigNumToDays(seconds: ethers.BigNumber) {
  return seconds.toNumber() / SECONDS_IN_DAY;
}

export function daysToSecondsBigNum(days: number) {
  return ethers.BigNumber.from(days * SECONDS_IN_DAY);
}
