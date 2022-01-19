import { formatTimeDigit, getDaysHoursMinutesSeconds } from 'lib/duration';
import { getNextLoanDue } from 'lib/loans/profileHeaderMethods';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loan } from 'types/Loan';

export function NextLoanCountdown({ loans }: { loans: Loan[] }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    getNextLoanDue(loans),
  );

  const refreshTimestamp = useCallback(
    (intervalId) => {
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        return;
      }
      setRemainingSeconds((prev) => prev - 1);
    },
    [remainingSeconds],
  );

  useEffect(() => {
    const timeOutId: NodeJS.Timeout = setInterval(
      () => refreshTimestamp(timeOutId),
      1000,
    );
    return () => clearInterval(timeOutId);
  }, [refreshTimestamp]);

  const { days, hours, minutes, seconds } = useMemo(
    () => getDaysHoursMinutesSeconds(remainingSeconds),
    [remainingSeconds],
  );

  return (
    <div>
      {days} days + {formatTimeDigit(hours)}:{formatTimeDigit(minutes)}:
      {formatTimeDigit(seconds)}
    </div>
  );
}
