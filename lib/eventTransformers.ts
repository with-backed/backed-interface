import { ethers } from 'ethers';
import * as EventTypes from 'types/Event';
import {
  BuyoutEvent,
  CloseEvent,
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';

export function createEventToUnified(
  event: CreateEvent,
  loanId: ethers.BigNumber,
): EventTypes.CreateEvent {
  return {
    ...event,
    typename: 'CreateEvent',
    minter: ethers.utils.getAddress(event.creator),
    maxInterestRate: ethers.BigNumber.from(event.maxPerSecondInterestRate),
    minLoanAmount: ethers.BigNumber.from(event.minLoanAmount),
    minDurationSeconds: ethers.BigNumber.from(event.minDurationSeconds),
    loanId,
  };
}

export function closeEventToUnified(
  event: CloseEvent,
  loanId: ethers.BigNumber,
): EventTypes.CloseEvent {
  return {
    ...event,
    typename: 'CloseEvent',
    loanId,
  };
}

export function collateralSeizureEventToUnified(
  event: CollateralSeizureEvent,
  loanId: ethers.BigNumber,
): EventTypes.CollateralSeizureEvent {
  return {
    ...event,
    typename: 'CollateralSeizureEvent',
    loanId,
  };
}

export function repaymentEventToUnified(
  event: RepaymentEvent,
  loanId: ethers.BigNumber,
): EventTypes.RepaymentEvent {
  return {
    ...event,
    typename: 'RepaymentEvent',
    loanOwner: ethers.utils.getAddress(event.lendTicketHolder),
    interestEarned: ethers.BigNumber.from(event.interestEarned),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
    repayer: ethers.utils.getAddress(event.repayer),
    loanId,
  };
}

export function lendEventToUnified(
  event: LendEvent,
  loanId: ethers.BigNumber,
): EventTypes.LendEvent {
  return {
    ...event,
    typename: 'LendEvent',
    interestRate: ethers.BigNumber.from(event.perSecondInterestRate),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
    durationSeconds: ethers.BigNumber.from(event.durationSeconds),
    underwriter: ethers.utils.getAddress(event.lender),
    loanId,
  };
}

export function buyoutEventToUnified(
  event: BuyoutEvent,
  loanId: ethers.BigNumber,
): EventTypes.BuyoutEvent {
  return {
    ...event,
    typename: 'BuyoutEvent',

    interestEarned: ethers.BigNumber.from(event.interestEarned),
    replacedAmount: ethers.BigNumber.from(event.loanAmount),
    underwriter: ethers.utils.getAddress(event.newLender),
    replacedLoanOwner: ethers.utils.getAddress(event.lendTicketHolder),
    loanId,
  };
}
