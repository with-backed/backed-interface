import { ethers } from 'ethers';

type BaseEvent = {
  id: string;
  loanId: ethers.BigNumber;
  blockNumber: number;
  timestamp: number;
  loanId: ethers.BigNumber;
};

export type BuyoutEvent = BaseEvent & {
  typename: 'BuyoutEvent';
  underwriter: string;
  replacedLoanOwner: string;
  interestEarned: ethers.BigNumber;
  replacedAmount: ethers.BigNumber;
};

export type CloseEvent = BaseEvent & {
  typename: 'CloseEvent';
};

export type CollateralSeizureEvent = BaseEvent & {
  typename: 'CollateralSeizureEvent';
};

export type CreateEvent = BaseEvent & {
  typename: 'CreateEvent';
  minter: string;
  maxInterestRate: ethers.BigNumber;
  minLoanAmount: ethers.BigNumber;
  minDurationSeconds: ethers.BigNumber;
};

export type LendEvent = BaseEvent & {
  typename: 'LendEvent';
  underwriter: string;
  interestRate: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  durationSeconds: ethers.BigNumber;
};

export type RepaymentEvent = BaseEvent & {
  typename: 'RepaymentEvent';
  repayer: string;
  loanOwner: string;
  interestEarned: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
};

export type Event =
  | BuyoutEvent
  | CloseEvent
  | CollateralSeizureEvent
  | CreateEvent
  | LendEvent
  | RepaymentEvent;
