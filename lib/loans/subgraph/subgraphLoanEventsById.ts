import { nftBackedLoansClient } from 'lib/urql';
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
import {
  EventsByLoanIdDocument,
  EventsByLoanIdQuery,
} from 'types/generated/graphql/nft-backed-loans-operations';

/**
 * @param id the id of the loan
 * @returns a list of all events associated with a loan in the subgraph, ordered by blockNumber ascending.
 */
export async function subgraphLoanHistoryById(id: string): Promise<Event[]> {
  const { data } = await nftBackedLoansClient
    .query<EventsByLoanIdQuery>(EventsByLoanIdDocument, { id })
    .toPromise();

  const loan = data?.loan;

  const events: Event[] = [];

  if (!loan) {
    return events;
  }

  if (loan.createEvent) {
    const event = loan.createEvent;
    events.push(createEventToUnified(event as CreateEvent));
  }

  if (loan.closeEvent) {
    const event = loan.closeEvent;
    events.push(closeEventToUnified(event as CloseEvent));
  }

  if (loan.collateralSeizureEvent) {
    const event = loan.collateralSeizureEvent;
    events.push(
      collateralSeizureEventToUnified(event as CollateralSeizureEvent),
    );
  }

  if (loan.repaymentEvent) {
    const event = loan.repaymentEvent;
    events.push(repaymentEventToUnified(event as RepaymentEvent));
  }

  if (loan.lendEvents && Array.isArray(loan.lendEvents)) {
    loan.lendEvents.forEach((event) => {
      events.push(lendEventToUnified(event as LendEvent));
    });
  }

  if (loan.buyoutEvents && Array.isArray(loan.buyoutEvents)) {
    loan.buyoutEvents.forEach((event) => {
      events.push(buyoutEventToUnified(event as BuyoutEvent));
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
