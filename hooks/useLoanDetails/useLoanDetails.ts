import { ethers } from 'ethers';
import { useTimestamp } from 'hooks/useTimestamp';
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
}: LoanStatusParams): string {
  if (closed) {
    return 'Closed';
  }

  if (!timestamp) {
    return 'Loading...';
  }

  if (lastAccumulatedTimestamp.eq(0)) {
    return 'Awaiting lender';
  }

  if (lastAccumulatedTimestamp.add(durationSeconds).lte(timestamp)) {
    return 'Past due';
  }

  return 'Accruing interest';
}

export function useLoanDetails(loan: Loan) {
  const {
    closed,
    durationSeconds,
    interestOwed,
    lastAccumulatedTimestamp,
    loanAmount,
    loanAssetDecimals,
    loanAssetSymbol,
    perSecondInterestRate,
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

  return {
    formattedInterestAccrued,
    formattedInterestRate,
    formattedPrincipal,
    formattedStatus,
    formattedTotalDuration,
  };
}
