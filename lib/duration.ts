import { ethers } from 'ethers';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SECONDS_IN_A_DAY } from './constants';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function humanizedDuration(
  duration: number,
  unit: duration.DurationUnitType = 'seconds',
) {
  return dayjs.duration(duration, unit).humanize();
}

export function secondsToDays(seconds: number) {
  return seconds / SECONDS_IN_A_DAY;
}

export function secondsBigNumToDays(seconds: ethers.BigNumber) {
  return seconds.toNumber() / SECONDS_IN_A_DAY;
}

export function daysToSecondsBigNum(days: number) {
  return ethers.BigNumber.from(days * SECONDS_IN_A_DAY);
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

export interface LoanCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getDaysHoursMinutesSeconds = (
  durationInSeconds: number,
): LoanCountdown => {
  let duration = dayjs.duration({ seconds: durationInSeconds });
  const days = Math.floor(duration.asDays());

  duration = duration.subtract(dayjs.duration(days, 'days'));
  const hours = Math.floor(duration.asHours());

  duration = duration.subtract(dayjs.duration(hours, 'hours'));
  const minutes = Math.floor(duration.asMinutes());

  duration = duration.subtract(dayjs.duration(minutes, 'minutes'));
  const seconds = Math.floor(duration.asSeconds());

  return { days, hours, minutes, seconds };
};

export function formatTimeDigit(t: number): string {
  if (t.toString().length === 1) {
    return `0${t.toString()}`;
  }
  return t.toString();
}
