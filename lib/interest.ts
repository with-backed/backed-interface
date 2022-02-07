import { ethers } from 'ethers';
import { INTEREST_RATE_PERCENT_DECIMALS, SECONDS_IN_A_YEAR } from './constants';

export const formattedAnnualRate = (ratePerSecond: ethers.BigNumber) =>
  ethers.utils.formatUnits(
    ratePerSecond.mul(SECONDS_IN_A_YEAR),
    INTEREST_RATE_PERCENT_DECIMALS,
  );

export const annualRateToPerSecond = (annualRate: number): string => {
  return Math.ceil(
    (annualRate / SECONDS_IN_A_YEAR) * Math.pow(10, 8),
  ).toString();
};
