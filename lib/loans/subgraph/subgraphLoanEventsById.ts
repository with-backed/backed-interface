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
import {
  buyoutEventToUnified,
  closeEventToUnified,
  collateralSeizureEventToUnified,
  createEventToUnified,
  lendEventToUnified,
  repaymentEventToUnified,
} from 'lib/eventTransformers';
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
  const { data } = await nftBackedLoansClient
    .query<{ loan: any }>(graphqlQuery, { id })
    .toPromise();

  const loan = data?.loan;

  const events: Event[] = [];

  if (!loan) {
    return events;
  }

  const bigNumLoanId = ethers.BigNumber.from(id);

  if (loan.createEvent) {
    const event = loan.createEvent as CreateEvent;
    events.push(createEventToUnified(event, bigNumLoanId));
  }

  if (loan.closeEvent) {
    const event = loan.closeEvent as CloseEvent;
    events.push(closeEventToUnified(event, bigNumLoanId));
  }

  if (loan.collateralSeizureEvent) {
    const event = loan.collateralSeizureEvent as CollateralSeizureEvent;
    events.push(collateralSeizureEventToUnified(event, bigNumLoanId));
  }

  if (loan.repaymentEvent) {
    const event = loan.repaymentEvent as RepaymentEvent;
    events.push(repaymentEventToUnified(event, bigNumLoanId));
  }

  if (loan.lendEvents && Array.isArray(loan.lendEvents)) {
    loan.lendEvents.forEach((event: LendEvent) => {
      events.push(lendEventToUnified(event, bigNumLoanId));
    });
  }

  if (loan.buyoutEvents && Array.isArray(loan.buyoutEvents)) {
    loan.buyoutEvents.forEach((event: BuyoutEvent) => {
      events.push(buyoutEventToUnified(event, bigNumLoanId));
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
