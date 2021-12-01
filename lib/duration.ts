import { ethers } from 'ethers';
import moment from 'moment';

const SECONDS_IN_DAY = 60 * 60 * 24;

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
