import { nftBackedLoansClient } from 'lib/urql';
import {
  BuyoutEvent,
  CloseEvent,
  CollateralSeizureEvent,
  CreateEvent,
  EventsForLoanDocument,
  EventsForLoanQuery,
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
import Bugsnag from '@bugsnag/js';

/**
 * @param id the id of the loan
 * @returns a list of all events associated with a loan in the subgraph, ordered by blockNumber ascending.
 */
export async function subgraphLoanHistoryById(id: string): Promise<Event[]> {
  const { data, error } = await nftBackedLoansClient
    .query<EventsForLoanQuery>(EventsForLoanDocument, { id })
    .toPromise();

  const events: Event[] = [];

  if (error) {
    Bugsnag.notify(error);
  }
  if (!data?.loan) {
    return events;
  }

  const loan = data.loan;

  const bigNumLoanId = ethers.BigNumber.from(id);

  if (loan.createEvent) {
    const event = loan.createEvent;
    events.push(createEventToUnified(event as CreateEvent, bigNumLoanId));
  }

  if (loan.closeEvent) {
    const event = loan.closeEvent;
    events.push(closeEventToUnified(event as CloseEvent, bigNumLoanId));
  }

  if (loan.collateralSeizureEvent) {
    const event = loan.collateralSeizureEvent;
    events.push(
      collateralSeizureEventToUnified(
        event as CollateralSeizureEvent,
        bigNumLoanId,
      ),
    );
  }

  if (loan.repaymentEvent) {
    const event = loan.repaymentEvent;
    events.push(repaymentEventToUnified(event as RepaymentEvent, bigNumLoanId));
  }

  if (loan.lendEvents && Array.isArray(loan.lendEvents)) {
    loan.lendEvents.forEach((event) => {
      events.push(lendEventToUnified(event as LendEvent, bigNumLoanId));
    });
  }

  if (loan.buyoutEvents && Array.isArray(loan.buyoutEvents)) {
    loan.buyoutEvents.forEach((event) => {
      events.push(buyoutEventToUnified(event as BuyoutEvent, bigNumLoanId));
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
