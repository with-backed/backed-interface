import type { Event } from 'types/Event';
import { nftBackedLoansClient } from 'lib/urql';
import { ALL_EVENTS } from './subgraphSharedConstants';
import { BuyoutEvent, LendEvent } from 'types/generated/graphql/nftLoans';

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

  if (loan.createEvent) {
    events.push({
      ...loan.createEvent,
      typename: 'CreateEvent',
    });
  }

  if (loan.closeEvent) {
    events.push({
      ...loan.closeEvent,
      typename: 'CloseEvent',
    });
  }

  if (loan.collateralSeizureEvent) {
    events.push({
      ...loan.collateralSeizureEvent,
      typename: 'CollateralSeizureEvent',
    });
  }

  if (loan.repaymentEvent) {
    events.push({
      ...loan.repaymentEvent,
      typename: 'RepaymentEvent',
    });
  }

  if (loan.lendEvents) {
    loan.lendEvents.forEach((event: LendEvent) => {
      events.push({
        ...event,
        typename: 'LendEvent',
      });
    });
  }

  if (loan.buyoutEvents) {
    loan.buyoutEvents.forEach((event: BuyoutEvent) => {
      events.push({
        ...event,
        typename: 'BuyoutEvent',
      });
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
}
