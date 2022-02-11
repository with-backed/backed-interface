import { ethers } from 'ethers';
import { Event } from 'types/Event';
import {
  BuyoutEvent,
  CloseEvent,
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';

export function createEventToUnified(event: CreateEvent): Event {
  return {
    ...event,
    typename: 'CreateEvent',
    minter: event.creator,
    maxInterestRate: ethers.BigNumber.from(event.maxPerSecondInterestRate),
    minLoanAmount: ethers.BigNumber.from(event.minLoanAmount),
    minDurationSeconds: ethers.BigNumber.from(event.minDurationSeconds),
  };
}

export function closeEventToUnified(event: CloseEvent): Event {
  return {
    ...event,
    typename: 'CloseEvent',
  };
}

export function collateralSeizureEventToUnified(
  event: CollateralSeizureEvent,
): Event {
  return {
    ...event,
    typename: 'CollateralSeizureEvent',
  };
}

export function repaymentEventToUnified(event: RepaymentEvent): Event {
  return {
    ...event,
    typename: 'RepaymentEvent',
    loanOwner: event.lendTicketHolder,
    interestEarned: ethers.BigNumber.from(event.interestEarned),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
  };
}

export function lendEventToUnified(event: LendEvent): Event {
  return {
    ...event,
    typename: 'LendEvent',
    interestRate: ethers.BigNumber.from(event.perSecondInterestRate),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
    durationSeconds: ethers.BigNumber.from(event.durationSeconds),
    underwriter: event.lender,
  };
}

export function buyoutEventToUnified(event: BuyoutEvent): Event {
  return {
    ...event,
    typename: 'BuyoutEvent',

    interestEarned: ethers.BigNumber.from(event.interestEarned),
    replacedAmount: ethers.BigNumber.from(event.loanAmount),
    underwriter: event.newLender,
    replacedLoanOwner: event.lendTicketHolder,
  };
}
