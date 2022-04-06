import { ethers } from 'ethers';
import { INTEREST_RATE_PERCENT_DECIMALS, SECONDS_IN_A_YEAR } from './constants';

export const formattedAnnualRate = (perAnumScaledRate: ethers.BigNumber) => {
  return ethers.utils.formatUnits(
    perAnumScaledRate,
    INTEREST_RATE_PERCENT_DECIMALS - 2,
  );
};

export const annualRateToPerSecond = (annualRate: number): string => {
  return Math.ceil(
    (annualRate / SECONDS_IN_A_YEAR) * Math.pow(10, 8),
  ).toString();
};
