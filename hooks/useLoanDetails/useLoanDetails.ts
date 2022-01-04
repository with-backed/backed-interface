import { ethers } from 'ethers';
import { useTimestamp } from 'hooks/useTimestamp';
import { SCALAR } from 'lib/constants';
import { humanizedDuration } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { Loan } from 'lib/types/Loan';
import { useMemo } from 'react';

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
    return 'Awaiting lender';
  }

  if (!timestamp) {
    return 'Loading...';
  }

  if (lastAccumulatedTimestamp.add(durationSeconds).lte(timestamp)) {
    return 'Past due';
  }

  return 'Accruing interest';
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
    perSecondInterestRate,
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
      ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
      loanAssetSymbol,
    ].join(' ');
  }, [loanAmount, loanAssetDecimals, loanAssetSymbol]);
  const formattedInterestRate = useMemo(() => {
    return [formattedAnnualRate(perSecondInterestRate), '%'].join('');
  }, [perSecondInterestRate]);
  const formattedTotalDuration = useMemo(() => {
    return humanizedDuration(durationSeconds.toNumber());
  }, [durationSeconds]);
  const formattedInterestAccrued = useMemo(() => {
    return [
      ethers.utils.formatUnits(interestOwed, loanAssetDecimals),
      loanAssetSymbol,
    ].join(' ');
  }, [interestOwed, loanAssetDecimals, loanAssetSymbol]);
  const formattedLoanID = useMemo(() => {
    return ['Loan #', id.toString()].join('');
  }, [id]);
  const formattedTotalPayback = useMemo(() => {
    return [
      ethers.utils.formatUnits(loanAmount.add(interestOwed), loanAssetDecimals),
      loanAssetSymbol,
    ].join(' ');
  }, [loanAmount, interestOwed, loanAssetDecimals, loanAssetSymbol]);
  const formattedEstimatedPaybackAtMaturity = useMemo(() => {
    const interestOverTerm = perSecondInterestRate
      .mul(durationSeconds)
      .mul(loanAmount)
      .div(SCALAR);

    const estimate = accumulatedInterest.add(loanAmount).add(interestOverTerm);

    return [
      ethers.utils.formatUnits(estimate, loanAssetDecimals),
      loanAssetSymbol,
    ].join(' ');
  }, [
    accumulatedInterest,
    durationSeconds,
    loanAssetSymbol,
    loanAmount,
    loanAssetDecimals,
    perSecondInterestRate,
  ]);
  const formattedTimeRemaining = useMemo(() => {
    if (!timestamp || endDateTimestamp === 0) {
      return '--';
    }
    return humanizedDuration(endDateTimestamp - timestamp);
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
