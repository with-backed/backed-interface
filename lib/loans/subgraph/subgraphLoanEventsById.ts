import { nftBackedLoansClient } from 'lib/urql';
import { ALL_EVENTS } from './subgraphSharedConstants';
import {
  BuyoutEvent,
  CloseEvent,
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { Event } from 'types/Event';
import { ethers } from 'ethers';

const graphqlQuery = `
query ($id: ID!) {
  loan(id: $id) {
    ${ALL_EVENTS}
  }
}
`;

/**
 * @param id the id of the loan
 * @returns a list of all events associated with a loan in the subgraph, ordered by blockNumber ascending.
 */
export async function subgraphLoanHistoryById(id: string): Promise<Event[]> {
  const {
    data: { loan },
  } = await nftBackedLoansClient.query(graphqlQuery, { id }).toPromise();

  const events: Event[] = [];

  if (loan.createEvent && loan.createEvent !== null) {
    const event = loan.createEvent as CreateEvent;
    events.push({
      ...event,
      typename: 'CreateEvent',
      minter: event.creator,
      maxInterestRate: ethers.BigNumber.from(event.maxPerSecondInterestRate),
      minLoanAmount: ethers.BigNumber.from(event.minLoanAmount),
      minDurationSeconds: ethers.BigNumber.from(event.minDurationSeconds),
    });
  }

  if (loan.closeEvent && loan.closeEvent !== null) {
    const event = loan.closeEvent as CloseEvent;
    events.push({
      ...event,
      typename: 'CloseEvent',
    });
  }

  if (loan.collateralSeizureEvent && loan.collateralSeizureEvent !== null) {
    const event = loan.collateralSeizureEvent as CollateralSeizureEvent;
    events.push({
      ...event,
      typename: 'CollateralSeizureEvent',
    });
  }

  if (loan.repaymentEvent && loan.repaymentEvent !== null) {
    const event = loan.repaymentEvent as RepaymentEvent;
    events.push({
      ...event,
      typename: 'RepaymentEvent',
      loanOwner: event.lendTicketHolder,
      interestEarned: ethers.BigNumber.from(event.interestEarned),
      loanAmount: ethers.BigNumber.from(event.loanAmount),
    });
  }

  if (loan.lendEvents && Array.isArray(loan.lendEvents)) {
    loan.lendEvents.forEach((event: LendEvent) => {
      events.push({
        ...event,
        typename: 'LendEvent',

        interestRate: ethers.BigNumber.from(event.perSecondInterestRate),
        loanAmount: ethers.BigNumber.from(event.loanAmount),
        durationSeconds: ethers.BigNumber.from(event.durationSeconds),
        underwriter: event.lender,
      });
    });
  }

  if (loan.buyoutEvents && Array.isArray(loan.buyoutEvents)) {
    loan.buyoutEvents.forEach((event: BuyoutEvent) => {
      events.push({
        ...event,
        typename: 'BuyoutEvent',

        interestEarned: ethers.BigNumber.from(event.interestEarned),
        replacedAmount: ethers.BigNumber.from(event.loanAmount),
        underwriter: event.newLender,
        replacedLoanOwner: event.lendTicketOwner,
      });
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
