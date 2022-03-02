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
): EventTypes.CreateEvent {
  return {
    ...event,
    typename: 'CreateEvent',
    minter: ethers.utils.getAddress(event.creator),
    maxInterestRate: ethers.BigNumber.from(event.maxPerSecondInterestRate),
    minLoanAmount: ethers.BigNumber.from(event.minLoanAmount),
    minDurationSeconds: ethers.BigNumber.from(event.minDurationSeconds),
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}

export function closeEventToUnified(event: CloseEvent): EventTypes.CloseEvent {
  return {
    ...event,
    typename: 'CloseEvent',
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}

export function collateralSeizureEventToUnified(
  event: CollateralSeizureEvent,
): EventTypes.CollateralSeizureEvent {
  return {
    ...event,
    typename: 'CollateralSeizureEvent',
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}

export function repaymentEventToUnified(
  event: RepaymentEvent,
): EventTypes.RepaymentEvent {
  return {
    ...event,
    typename: 'RepaymentEvent',
    loanOwner: ethers.utils.getAddress(event.lendTicketHolder),
    interestEarned: ethers.BigNumber.from(event.interestEarned),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
    repayer: ethers.utils.getAddress(event.repayer),
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}

export function lendEventToUnified(event: LendEvent): EventTypes.LendEvent {
  return {
    ...event,
    typename: 'LendEvent',
    interestRate: ethers.BigNumber.from(event.perSecondInterestRate),
    loanAmount: ethers.BigNumber.from(event.loanAmount),
    durationSeconds: ethers.BigNumber.from(event.durationSeconds),
    underwriter: ethers.utils.getAddress(event.lender),
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}

export function buyoutEventToUnified(
  event: BuyoutEvent,
): EventTypes.BuyoutEvent {
  return {
    ...event,
    typename: 'BuyoutEvent',

    interestEarned: ethers.BigNumber.from(event.interestEarned),
    replacedAmount: ethers.BigNumber.from(event.loanAmount),
    underwriter: ethers.utils.getAddress(event.newLender),
    replacedLoanOwner: ethers.utils.getAddress(event.lendTicketHolder),
    loanId: ethers.BigNumber.from(event.loan.id),
  };
}
