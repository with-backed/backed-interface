import { ethers } from 'ethers';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Fieldset } from 'components/Fieldset';

interface LoanDurationCardProps {
  lastAccumulatedInterest: ethers.BigNumber;
  loanDuration: ethers.BigNumber;
}

const getCurrentUnixTime = () => new Date().getTime() / 1000;

const getDaysHoursMinutesSeconds = (duration: moment.Duration) => {
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

export default function LoanDurationCard({
  lastAccumulatedInterest,
  loanDuration,
}: LoanDurationCardProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.round(
      lastAccumulatedInterest.add(loanDuration).toNumber() -
        getCurrentUnixTime(),
    ),
  );

  const refreshTimestamp = useCallback(() => {
    setRemainingSeconds((prev) => prev - 1);
  }, []);

  useEffect(() => {
    const timeOutId = setInterval(() => refreshTimestamp(), 1000);
    return () => clearInterval(timeOutId);
  }, [refreshTimestamp]);

  const { days, hours, minutes, seconds } = getDaysHoursMinutesSeconds(
    moment.duration(remainingSeconds, 'seconds'),
  );

  return (
    <Fieldset legend="loan duration">
      <div className="loan-duration-card">
        <div className="date-box">
          <div className="date-number">{days}</div>
          <div>days</div>
        </div>
        <div className="date-box">
          <div className="date-number">{hours}</div>
          <div>hours</div>
        </div>
        <div className="date-box">
          <div className="date-number">{minutes}</div>
          <div>minutes</div>
        </div>
        <div className="date-box">
          <div className="date-number">{seconds}</div>
          <div>seconds</div>
        </div>
      </div>
    </Fieldset>
  );
}
