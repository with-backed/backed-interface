import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { subgraphLoan } from 'lib/mockData';

export const subgraphLoanForEvents = {
  ...subgraphLoan,
  lendTicketHolder: '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
  lastAccumulatedTimestamp: subgraphLoan.createdAtTimestamp,
  endDateTimestamp: 50000,
};

export const subgraphBuyoutEvent: BuyoutEvent = {
  id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  blockNumber: 9950758,
  loanAmount: '8000000000000000000000',
  interestEarned: '10000',
  newLender: subgraphLoanForEvents.lendTicketHolder,
  lendTicketHolder: '0x10359616ab170c1bd6c478a40c6715a49ba25efc',
  loan: {
    ...subgraphLoanForEvents,
    loanAmount: '8193000000000000000000',
  },
  timestamp: 1641574026,
};

export const subgraphLendEvent: LendEvent = {
  id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  blockNumber: 9950758,
  durationSeconds: subgraphLoanForEvents.durationSeconds,
  perSecondInterestRate: subgraphLoanForEvents.perSecondInterestRate,
  loanAmount: subgraphLoanForEvents.loanAmount,
  lender: subgraphLoanForEvents.lendTicketHolder,
  borrowTicketHolder: subgraphLoanForEvents.borrowTicketHolder,
  loan: subgraphLoanForEvents,
  timestamp: 1641574026,
};

export const subgraphRepaymentEvent: RepaymentEvent = {
  id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  blockNumber: 9950758,
  interestEarned: '100000000000000000',
  loanAmount: subgraphLoanForEvents.loanAmount,
  repayer: subgraphLoanForEvents.borrowTicketHolder,
  loan: subgraphLoanForEvents,
  borrowTicketHolder: subgraphLoanForEvents.borrowTicketHolder,
  lendTicketHolder: subgraphLoanForEvents.lendTicketHolder,
  timestamp: subgraphLoanForEvents.createdAtTimestamp + 2 * 3600,
};

export const subgraphCollateralSeizureEvent: CollateralSeizureEvent = {
  id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  blockNumber: 9950758,
  loan: subgraphLoanForEvents,
  borrowTicketHolder: subgraphLoanForEvents.borrowTicketHolder,
  lendTicketHolder: subgraphLoanForEvents.lendTicketHolder,
  timestamp: subgraphLoanForEvents.createdAtTimestamp + 3200,
};
