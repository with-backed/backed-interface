import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ethers } from 'ethers';
import { addressToENS } from 'lib/account';
import { secondsBigNumToDaysBigNum } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { interestOverTerm } from 'lib/loans/utils';
import { Loan as ParsedLoan } from 'types/Loan';

dayjs.extend(duration);

export const ensOrAddr = async (rawAddress: string): Promise<string> => {
  const ens = await addressToENS(rawAddress);
  if (ens === null) {
    return rawAddress.substring(0, 7);
  }
  return ens;
};

export const formattedDate = (timestamp: number): string =>
  dayjs.unix(timestamp).format('MM/DD/YYYY');

export const getEstimatedRepaymentAndMaturity = (
  loan: ParsedLoan,
  duration: ethers.BigNumber = loan.durationSeconds,
): [string, string] => {
  const interest = interestOverTerm(
    loan.perAnumInterestRate,
    secondsBigNumToDaysBigNum(duration),
    loan.loanAmount,
  );

  const estimatedRepayment = ethers.utils.formatUnits(
    loan.accumulatedInterest.add(interest).add(loan.loanAmount),
    loan.loanAssetDecimals,
  );

  const dateOfMaturity = formattedDate(loan.endDateTimestamp!);

  return [estimatedRepayment, dateOfMaturity];
};

export const formattedLoanTerms = (
  loanAmount: number,
  loanAssetDecimal: number,
  perAnumInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
) => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perAnumInterestRate),
  );

  return {
    amount,
    duration: formattedDuration(durationSeconds),
    interest: `${interest}%`,
  };
};

export const formattedDuration = (duration: number): string => {
  const days = Math.floor(dayjs.duration({ seconds: duration }).asDays());
  if (days != 0) {
    return days === 1 ? `${days} day` : `${days} days`;
  }

  const hours = Math.floor(dayjs.duration({ seconds: duration }).asHours());
  if (hours != 0) {
    return hours === 1 ? `${hours} hour` : `${hours} hours`;
  }

  const minutes = Math.floor(dayjs.duration({ seconds: duration }).asMinutes());
  return minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
};
