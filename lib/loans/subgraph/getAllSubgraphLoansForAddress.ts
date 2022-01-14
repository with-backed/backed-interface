import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import {
  BuyoutEvent,
  BuyoutEvent_Filter,
  BuyoutEvent_OrderBy,
  CollateralSeizureEvent,
  CollateralSeizureEvent_Filter,
  CollateralSeizureEvent_OrderBy,
  LendEvent,
  LendEvent_Filter,
  LendEvent_OrderBy,
  Loan,
  Loan_Filter,
  Loan_OrderBy,
  OrderDirection,
  QueryBuyoutEventsArgs,
  QueryCollateralSeizureEventsArgs,
  QueryLendEventsArgs,
  QueryLoansArgs,
  QueryRepaymentEventsArgs,
  RepaymentEvent,
  RepaymentEvent_Filter,
  RepaymentEvent_OrderBy,
} from 'types/generated/graphql/nftLoans';
import { nftBackedLoansClient } from '../../urql';
import { gql } from 'urql';
import { Dictionary, groupBy } from 'lodash';

const activeLoansQuery = gql`
    query($where: Loan_filter , $first: Int, $orderBy: String, $orderDirection: String) {
      loans(
        where: $where,
        orderBy: $orderBy, 
        orderDirection: $orderDirection
      ) {
        ${ALL_LOAN_PROPERTIES}
      }
    }
  `;

export async function getAllActiveLoansForAddress(
  address: string,
): Promise<Loan[]> {
  const sharedQueryArgs: QueryLoansArgs = {
    orderBy: Loan_OrderBy.CreatedAtTimestamp,
    orderDirection: OrderDirection.Desc,
  };

  const whereFilterAsBorrower: Loan_Filter = {
    closed: false,
    borrowTicketHolder: address,
  };
  const queryArgsAsBorrower: QueryLoansArgs = {
    ...sharedQueryArgs,
    where: whereFilterAsBorrower,
  };

  const whereFilterAsLender: Loan_Filter = {
    closed: false,
    lendTicketHolder: address,
  };
  const queryArgsAsLender: QueryLoansArgs = {
    ...sharedQueryArgs,
    where: whereFilterAsLender,
  };

  const resultArray: { data?: { loans: Loan[] } }[] = await Promise.all([
    nftBackedLoansClient
      .query(activeLoansQuery, queryArgsAsBorrower)
      .toPromise(),
    nftBackedLoansClient.query(activeLoansQuery, queryArgsAsLender).toPromise(),
  ]);

  return resultArray
    .map((result) => (result.data ? result.data.loans : []))
    .flat();
}

export type AllEventsType =
  | BuyoutEvent
  | CollateralSeizureEvent
  | RepaymentEvent
  | LendEvent;

type EventFilter =
  | BuyoutEvent_Filter
  | CollateralSeizureEvent_Filter
  | RepaymentEvent_Filter
  | LendEvent_Filter;

function eventsQuery(eventName: string, whereFilterType: string) {
  return gql`
    query($where: ${whereFilterType}, $first: Int, $orderBy: String, $orderDirection: String) {
      ${eventName}(
        where: $where,
        orderBy: $orderBy, 
        orderDirection: $orderDirection
      ) {
        loan {
          ${ALL_LOAN_PROPERTIES}
        }
      }
    }
  `;
}

async function getAllBuyoutEventsForAddress(
  address: string,
): Promise<BuyoutEvent[]> {
  const sharedQueryArgs: QueryBuyoutEventsArgs = {
    orderBy: BuyoutEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const asBuyerArgs: QueryBuyoutEventsArgs = {
    ...sharedQueryArgs,
    where: { newLender: address },
  };
  const asBoughtOutArgs: QueryBuyoutEventsArgs = {
    ...sharedQueryArgs,
    where: { lendTicketOwner: address },
  };

  const resultArray: { data?: { buyoutEvents: BuyoutEvent[] } }[] =
    await Promise.all([
      nftBackedLoansClient
        .query(eventsQuery('buyoutEvents', 'BuyoutEvent_filter'), asBuyerArgs)
        .toPromise(),
      nftBackedLoansClient
        .query(
          eventsQuery('buyoutEvents', 'BuyoutEvent_filter'),
          asBoughtOutArgs,
        )
        .toPromise(),
    ]);

  return resultArray
    .map((result) => (result.data ? result.data.buyoutEvents : []))
    .flat();
}

async function getAllCollateralSeizedEvents(
  address: string,
): Promise<CollateralSeizureEvent[]> {
  const sharedQueryArgs: QueryCollateralSeizureEventsArgs = {
    orderBy: CollateralSeizureEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const asSeized: QueryCollateralSeizureEventsArgs = {
    ...sharedQueryArgs,
    where: { lendTicketHolder: address },
  };
  const asSeizing: QueryCollateralSeizureEventsArgs = {
    ...sharedQueryArgs,
    where: { borrowTicketHolder: address },
  };

  const resultArray: {
    data?: { collateralSeizureEvents: CollateralSeizureEvent[] };
  }[] = await Promise.all([
    nftBackedLoansClient
      .query(
        eventsQuery('collateralSeizureEvents', 'CollateralSeizureEvent_filter'),
        asSeized,
      )
      .toPromise(),
    nftBackedLoansClient
      .query(
        eventsQuery('collateralSeizureEvents', 'CollateralSeizureEvent_filter'),
        asSeizing,
      )
      .toPromise(),
  ]);

  return resultArray
    .map((result) => (result.data ? result.data.collateralSeizureEvents : []))
    .flat();
}

async function getAllRepaymentEvents(
  address: string,
): Promise<RepaymentEvent[]> {
  const sharedQueryArgs: QueryRepaymentEventsArgs = {
    orderBy: RepaymentEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const asPaid: QueryRepaymentEventsArgs = {
    ...sharedQueryArgs,
    where: { lendTicketHolder: address },
  };
  const asReceived: QueryRepaymentEventsArgs = {
    ...sharedQueryArgs,
    where: { borrowTicketHolder: address },
  };

  const resultArray: { data?: { repaymentEvents: RepaymentEvent[] } }[] =
    await Promise.all([
      nftBackedLoansClient
        .query(eventsQuery('repaymentEvents', 'RepaymentEvent_filter'), asPaid)
        .toPromise(),
      nftBackedLoansClient
        .query(
          eventsQuery('repaymentEvents', 'RepaymentEvent_filter'),
          asReceived,
        )
        .toPromise(),
    ]);

  return resultArray
    .map((result) => (result.data ? result.data.repaymentEvents : []))
    .flat();
}

async function getAllLendEvents(address: string): Promise<LendEvent[]> {
  const sharedQueryArgs: QueryLendEventsArgs = {
    orderBy: LendEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const asLender: QueryLendEventsArgs = {
    ...sharedQueryArgs,
    where: { lender: address },
  };
  const asLendee: QueryLendEventsArgs = {
    ...sharedQueryArgs,
    where: { borrowTicketHolder: address },
  };

  const resultArray: { data?: { lendEvents: LendEvent[] } }[] =
    await Promise.all([
      nftBackedLoansClient
        .query(eventsQuery('lendEvents', 'LendEvent_filter'), asLender)
        .toPromise(),
      nftBackedLoansClient
        .query(eventsQuery('lendEvents', 'LendEvent_filter'), asLendee)
        .toPromise(),
    ]);

  return resultArray
    .map((result) => (result.data ? result.data.lendEvents : []))
    .flat();
}

export async function getAllLoansFromEventsForAddress(
  address: string,
): Promise<Dictionary<[AllEventsType, ...AllEventsType[]]>> {
  const allEventLoans = await Promise.all([
    getAllBuyoutEventsForAddress(address),
    getAllCollateralSeizedEvents(address),
    getAllRepaymentEvents(address),
    getAllLendEvents(address),
  ]);

  console.log(allEventLoans);

  return groupBy(allEventLoans.flat(), (event) => event.__typename?.toString());
}
