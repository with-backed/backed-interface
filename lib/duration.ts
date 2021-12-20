import { ethers } from 'ethers';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const SECONDS_IN_DAY = 60 * 60 * 24;

export function humanizedDuration(
  duration: number,
  unit: duration.DurationUnitType = 'seconds',
) {
  return dayjs.duration(duration, unit).humanize();
}

export function secondsToDays(seconds: number) {
  return seconds / SECONDS_IN_DAY;
}

export function secondsBigNumToDays(seconds: ethers.BigNumber) {
  return seconds.toNumber() / SECONDS_IN_DAY;
}

export function daysToSecondsBigNum(days: number) {
  return ethers.BigNumber.from(days * SECONDS_IN_DAY);
}

export const getCurrentUnixTime = (): ethers.BigNumber =>
  ethers.BigNumber.from(Math.floor(new Date().getTime() / 1000));

export const computeInitialRemaining = (
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

export const getDaysHoursMinutesSeconds = (
  durationInSeconds: number,
): LoanCountdown => {
  const duration = dayjs.duration({ seconds: durationInSeconds });
  const days = Math.floor(duration.asDays());

  const hours = Math.floor(
    duration.subtract(dayjs.duration(days, 'days')).asHours(),
  );
  const minutes = Math.floor(
    duration.subtract(dayjs.duration(hours, 'hours')).asMinutes(),
  );
  const seconds = Math.floor(
    duration.subtract(dayjs.duration(minutes, 'minutes')).asSeconds(),
  );
  return { days, hours, minutes, seconds };
};
