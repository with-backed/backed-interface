import { ethers } from 'ethers';
import { useTimestamp } from 'hooks/useTimestamp';
import { SCALAR } from 'lib/constants';
import { humanizedDuration, secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { Loan } from 'types/Loan';
import { useMemo } from 'react';
import { interestOverTerm } from 'lib/loans/utils';

type LoanStatusParams = {
  timestamp: number | null;
  closed: boolean;
  lastAccumulatedTimestamp: ethers.BigNumber;
  durationSeconds: ethers.BigNumber;
};

function loanStatus({
  timestamp,
  closed,
  durationSeconds,
  lastAccumulatedTimestamp,
}: LoanStatusParams) {
  if (closed) {
    return 'Closed';
  }

  if (lastAccumulatedTimestamp.eq(0)) {
    return 'No lender';
  }

  if (!timestamp) {
    return 'Loading...';
  }

  if (lastAccumulatedTimestamp.add(durationSeconds).lte(timestamp)) {
    return 'Past due';
  }

  return 'Accruing interest';
}

function truncate(numberString: string, maxDigits: number = 4) {
  const number = parseFloat(numberString);
  const delta = number - (number ^ 0);
  // TODO: handle very small numbers that may render as 0.0000
  return number.toFixed(delta > 0 ? maxDigits : 0);
}

export function useLoanDetails(loan: Loan) {
  const {
    id,
    closed,
    durationSeconds,
    interestOwed,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    loanAmount,
    loanAssetDecimals,
    loanAssetSymbol,
    perAnumInterestRate,
    endDateTimestamp,
  } = loan;
  const timestamp = useTimestamp();
  const formattedStatus = useMemo(
    () =>
      loanStatus({
        timestamp,
        closed,
        durationSeconds,
        lastAccumulatedTimestamp,
      }),
    [timestamp, closed, durationSeconds, lastAccumulatedTimestamp],
  );
  const formattedPrincipal = useMemo(() => {
    return [
      truncate(ethers.utils.formatUnits(loanAmount, loanAssetDecimals)),
      loanAssetSymbol,
    ].join(' ');
  }, [loanAmount, loanAssetDecimals, loanAssetSymbol]);
  const formattedInterestRate = useMemo(() => {
    return [truncate(perAnumInterestRate.div(10).toString()), '%'].join('');
  }, [perAnumInterestRate]);
  const formattedTotalDuration = useMemo(() => {
    return humanizedDuration(durationSeconds.toNumber());
  }, [durationSeconds]);
  const formattedInterestAccrued = useMemo(() => {
    return [
      truncate(ethers.utils.formatUnits(interestOwed, loanAssetDecimals)),
      loanAssetSymbol,
    ].join(' ');
  }, [interestOwed, loanAssetDecimals, loanAssetSymbol]);
  const formattedLoanID = useMemo(() => {
    return ['Loan #', id.toString()].join('');
  }, [id]);
  const formattedTotalPayback = useMemo(() => {
    return [
      truncate(
        ethers.utils.formatUnits(
          loanAmount.add(interestOwed),
          loanAssetDecimals,
        ),
      ),
      loanAssetSymbol,
    ].join(' ');
  }, [loanAmount, interestOwed, loanAssetDecimals, loanAssetSymbol]);
  const formattedEstimatedPaybackAtMaturity = useMemo(() => {
    const totalInterest = interestOverTerm(
      perAnumInterestRate,
      ethers.BigNumber.from(secondsBigNumToDays(durationSeconds)),
      loanAmount,
    );
    const estimate = accumulatedInterest.add(loanAmount).add(totalInterest);

    return [
      truncate(ethers.utils.formatUnits(estimate, loanAssetDecimals)),
      loanAssetSymbol,
    ].join(' ');
  }, [
    accumulatedInterest,
    durationSeconds,
    loanAssetSymbol,
    loanAmount,
    loanAssetDecimals,
    perAnumInterestRate,
  ]);

  // TODO: don't conflate "status" with "time remaining"
  const formattedTimeRemaining = useMemo(() => {
    if (!timestamp) {
      return '--';
    }
    if (endDateTimestamp === 0) {
      return 'no lender';
    }
    if (timestamp > endDateTimestamp) {
      return 'past due';
    }
    return humanizedDuration(endDateTimestamp - timestamp) + ' left';
  }, [endDateTimestamp, timestamp]);

  return {
    formattedInterestAccrued,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
    formattedStatus,
    formattedTotalDuration,
    formattedTotalPayback,
    formattedEstimatedPaybackAtMaturity,
    formattedTimeRemaining,
  };
}
