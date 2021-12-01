import { ethers } from 'ethers';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fieldset } from 'components/Fieldset';
import styles from './LoanDurationCard.module.css';
import {
  computeInitialRemaining,
  getCurrentUnixTime,
  getDaysHoursMinutesSeconds,
} from 'lib/duration';

interface LoanDurationCardProps {
  lastAccumulatedInterest: ethers.BigNumber;
  loanDuration: ethers.BigNumber;
}

export function LoanDurationCard({
  lastAccumulatedInterest,
  loanDuration,
}: LoanDurationCardProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    ethers.BigNumber.from(0),
  );

  const refreshTimestamp = useCallback(
    (intervalId: ReturnType<typeof setTimeout>) => {
      if (remainingSeconds.lte(ethers.BigNumber.from(0))) {
        clearInterval(intervalId);
        return;
      }
      setRemainingSeconds((prev) => prev.sub(1));
    },
    [remainingSeconds],
  );

  useEffect(() => {
    const timeOutId: ReturnType<typeof setTimeout> = setInterval(
      () => refreshTimestamp(timeOutId),
      1000,
    );
    return () => clearInterval(timeOutId);
  }, [refreshTimestamp]);

  useEffect(() => {
    setRemainingSeconds(
      computeInitialRemaining(
        lastAccumulatedInterest,
        loanDuration,
        getCurrentUnixTime(),
      ),
    );
  }, [lastAccumulatedInterest, loanDuration]);

  const { days, hours, minutes, seconds } = useMemo(
    () =>
      getDaysHoursMinutesSeconds(
        moment.duration(remainingSeconds.toNumber(), 'seconds'),
      ),
    [remainingSeconds],
  );

  return (
    <Fieldset legend="loan duration">
      <div className={styles.loanDurationCard}>
        <div className={styles.dateBox}>
          <div className={styles.dateNumber}>{days}</div>
          <div>
            <p>Days</p>
          </div>
        </div>
        <div className={styles.dateBox}>
          <div className={styles.dateNumber}>{hours}</div>
          <div>
            <p>Hours</p>
          </div>
        </div>
        <div className={styles.dateBox}>
          <div className={styles.dateNumber}>{minutes}</div>
          <div>
            <p>Minutes</p>
          </div>
        </div>
        <div className={styles.dateBox}>
          <div className={styles.dateNumber}>{seconds}</div>
          <div>
            <p>Seconds</p>
          </div>
        </div>
      </div>
    </Fieldset>
  );
}
