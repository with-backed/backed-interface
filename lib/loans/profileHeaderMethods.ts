import { ethers } from 'ethers';
import {
  getCurrentUnixTime,
  getDaysHoursMinutesSeconds,
  LoanCountdown,
} from 'lib/duration';
import { Loan } from 'types/Loan';

export function getActiveLoanCount(loans: Loan[]): number {
  console.log({ loans });
  return loans.filter((l) => !l.closed).length;
}

export function getClosedLoanCount(loans: Loan[]): number {
  return loans.filter((l) => l.closed).length;
}

export function getNextLoanDue(loans: Loan[]): number {
  const nearestLoanDueDuration =
    loans.sort(
      (loanOne, loanTwo) => loanOne.endDateTimestamp - loanTwo.endDateTimestamp,
    )[0].endDateTimestamp - getCurrentUnixTime().toNumber();
  return nearestLoanDueDuration > 0 ? nearestLoanDueDuration : 0;
}

export function getAllPrincipalAmounts(
  loans: Loan[],
): { nominal: string; symbol: string }[] {
  return loans.map((l) => ({
    nominal: ethers.utils.formatUnits(l.loanAmount, l.loanAssetDecimals),
    symbol: l.loanAssetSymbol,
  }));
}

export function getAllInterestAmounts(
  loans: Loan[],
): { nominal: string; symbol: string }[] {
  return loans.map((l) => ({
    nominal: ethers.utils.formatUnits(l.interestOwed, l.loanAssetDecimals),
    symbol: l.loanAssetSymbol,
  }));
}
