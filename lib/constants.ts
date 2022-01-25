import { ethers } from 'ethers';

// TODO: fetch this from the contract on build? Maybe in an env var.
export const SCALAR = ethers.BigNumber.from(10).pow(10);

export const SECONDS_IN_A_DAY = 60 * 60 * 24;
export const SECONDS_IN_A_YEAR = 31_536_000;
export const INTEREST_RATE_PERCENT_DECIMALS = 8;
export const MIN_RATE = 1 / 10 ** INTEREST_RATE_PERCENT_DECIMALS;
