import { ethers } from 'ethers';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fieldset } from 'components/Fieldset';
import styles from './LoanDurationCard.module.css';

interface LoanDurationCardProps {
  lastAccumulatedInterest: ethers.BigNumber;
  loanDuration: ethers.BigNumber;
}

const getCurrentUnixTime = (): ethers.BigNumber =>
  ethers.BigNumber.from(Math.floor(new Date().getTime() / 1000));

const computeInitialRemaining = (
  lastAccumulatedInterest: ethers.BigNumber,
  loanDuration: ethers.BigNumber,
  now: ethers.BigNumber,
): ethers.BigNumber => {
  if (lastAccumulatedInterest.add(loanDuration).lt(now))
    return ethers.BigNumber.from(0);
  return lastAccumulatedInterest.add(loanDuration).sub(now);
};

interface LoanCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getDaysHoursMinutesSeconds = (
  duration: moment.Duration,
): LoanCountdown => {
  const days = Math.floor(duration.asDays());

  const hours = Math.floor(
    duration.subtract(moment.duration(days, 'days')).asHours(),
  );
  const minutes = Math.floor(
    duration.subtract(moment.duration(hours, 'hours')).asMinutes(),
  );
  const seconds = Math.floor(
    duration.subtract(moment.duration(minutes, 'minutes')).asSeconds(),
  );
  return { days, hours, minutes, seconds };
};

export function LoanDurationCard({
  lastAccumulatedInterest,
  loanDuration,
}: LoanDurationCardProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    computeInitialRemaining(
      lastAccumulatedInterest,
      loanDuration,
      getCurrentUnixTime(),
    ),
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
