import { ethers } from 'ethers';

export const SECONDS_IN_A_DAY = 60 * 60 * 24;
export const SECONDS_IN_A_YEAR = 31_536_000;
export const INTEREST_RATE_PERCENT_DECIMALS = 3;
export const MIN_RATE = 1 / 10 ** (INTEREST_RATE_PERCENT_DECIMALS - 2);

export const SCALAR = ethers.BigNumber.from(10).pow(
  INTEREST_RATE_PERCENT_DECIMALS,
);
