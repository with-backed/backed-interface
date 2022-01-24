import { ethers } from 'ethers';
import { getInterestOwed } from 'lib/loans/utils';
import { useCallback, useEffect, useState } from 'react';

type IncrementingInterestProps = {
  loanAmount: ethers.BigNumber;
  lastAccumulatedTimestamp: ethers.BigNumber;
  perSecondInterestRate: ethers.BigNumber;
  accumulatedInterest: ethers.BigNumber;
};

const now = () => ethers.BigNumber.from(Date.now()).div(1000);

export function IncrementingInterest({
  loanAmount,
  lastAccumulatedTimestamp,
  perSecondInterestRate,
  accumulatedInterest,
}: IncrementingInterestProps) {
  const [liveInterest, setLiveInterest] = useState<ethers.BigNumber>(
    getInterestOwed(
      now(),
      loanAmount,
      lastAccumulatedTimestamp,
      perSecondInterestRate,
      accumulatedInterest,
    ),
  );

  const refreshInterest = useCallback(
    (intervalId) => {
      setLiveInterest(
        getInterestOwed(
          now(),
          loanAmount,
          lastAccumulatedTimestamp,
          perSecondInterestRate,
          accumulatedInterest,
        ),
      );
    },
    [
      accumulatedInterest,
      loanAmount,
      lastAccumulatedTimestamp,
      perSecondInterestRate,
    ],
  );

  useEffect(() => {
    const timeOutId: NodeJS.Timeout = setInterval(
      () => refreshInterest(timeOutId),
      1000,
    );
    return () => clearInterval(timeOutId);
  }, [refreshInterest]);

  return <div>incrementing interest</div>;
}
