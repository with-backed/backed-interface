import { Loan } from 'types/Loan';

export function getActiveLoanCount(loans: Loan[]): number {
  return loans.filter((l) => !l.closed).length;
}

export function getClosedLoanCount(loans: Loan[]): number {
  return loans.filter((l) => l.closed).length;
}

// returns timestamp of when closest loan is due
export function getNextLoanDueAt(loans: Loan[]): number {
  return loans.sort(
    (loanOne, loanTwo) => loanOne.endDateTimestamp - loanTwo.endDateTimestamp,
  )[0].endDateTimestamp;
}
