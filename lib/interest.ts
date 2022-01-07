import { ethers } from 'ethers';

const SECONDS_IN_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;

export const formattedAnnualRate = (ratePerSecond: ethers.BigNumber) =>
  ethers.utils.formatUnits(
    ratePerSecond.mul(SECONDS_IN_YEAR),
    INTEREST_RATE_PERCENT_DECIMALS,
  );

export const annualRateToPerSecond = (annualRate: number): string => {
  return Math.ceil((annualRate / SECONDS_IN_YEAR) * Math.pow(10, 8)).toString();
};
