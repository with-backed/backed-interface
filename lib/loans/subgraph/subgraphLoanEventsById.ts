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
import {
  buyoutEventToUnified,
  closeEventToUnified,
  collateralSeizureEventToUnified,
  createEventToUnified,
  lendEventToUnified,
  repaymentEventToUnified,
} from 'lib/eventTransformers';

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
    events.push(createEventToUnified(event));
  }

  if (loan.closeEvent && loan.closeEvent !== null) {
    const event = loan.closeEvent as CloseEvent;
    events.push(closeEventToUnified(event));
  }

  if (loan.collateralSeizureEvent && loan.collateralSeizureEvent !== null) {
    const event = loan.collateralSeizureEvent as CollateralSeizureEvent;
    events.push(collateralSeizureEventToUnified(event));
  }

  if (loan.repaymentEvent && loan.repaymentEvent !== null) {
    const event = loan.repaymentEvent as RepaymentEvent;
    events.push(repaymentEventToUnified(event));
  }

  if (loan.lendEvents && Array.isArray(loan.lendEvents)) {
    loan.lendEvents.forEach((event: LendEvent) => {
      events.push(lendEventToUnified(event));
    });
  }

  if (loan.buyoutEvents && Array.isArray(loan.buyoutEvents)) {
    loan.buyoutEvents.forEach((event: BuyoutEvent) => {
      events.push(buyoutEventToUnified(event));
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
