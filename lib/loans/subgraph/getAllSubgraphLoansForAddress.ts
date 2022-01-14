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

type EventType =
  | BuyoutEvent
  | CollateralSeizureEvent
  | RepaymentEvent
  | LendEvent;

type EventFilter =
  | BuyoutEvent_Filter
  | CollateralSeizureEvent_Filter
  | RepaymentEvent_Filter
  | LendEvent_Filter;

type EventQueryArgs =
  | QueryBuyoutEventsArgs
  | QueryCollateralSeizureEventsArgs
  | QueryRepaymentEventsArgs
  | QueryLendEventsArgs;

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

async function getEventsForEventType<T>(
  eventQueryname: string,
  eventFilterType: string,
  whereArgs: EventFilter[],
): Promise<T[]> {
  const sharedQueryArgs: EventQueryArgs = {
    orderBy: BuyoutEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const resultArray: { data?: { [eventQueryname: string]: T[] } }[] =
    await Promise.all(
      whereArgs.map((where) =>
        nftBackedLoansClient
          .query(eventsQuery(eventQueryname, eventFilterType), {
            ...sharedQueryArgs,
            where,
          })
          .toPromise(),
      ),
    );

  return resultArray
    .map((result) => (result.data ? result.data[eventQueryname] : []))
    .flat();
}

export async function getAllEventsForAddress(
  address: string,
): Promise<Dictionary<[EventType, ...EventType[]]>> {
  const buyoutWhereFilters: BuyoutEvent_Filter[] = [
    { newLender: address },
    { lendTicketOwner: address },
  ];

  const collateralSeizedWhereFilters: CollateralSeizureEvent_Filter[] = [
    { borrowTicketHolder: address },
    { lendTicketHolder: address },
  ];

  const repaymentWhereFilters: RepaymentEvent_Filter[] = [
    { borrowTicketHolder: address },
    { lendTicketHolder: address },
  ];

  const lendWhereFilters: LendEvent_Filter[] = [
    { borrowTicketHolder: address },
    { lender: address },
  ];

  const allEventLoans = await Promise.all([
    getEventsForEventType<BuyoutEvent>(
      'buyoutEvents',
      'BuyoutEvent_filter',
      buyoutWhereFilters,
    ),
    getEventsForEventType<CollateralSeizureEvent>(
      'collateralSeizedEvents',
      'CollateralSeizureEvent_filter',
      collateralSeizedWhereFilters,
    ),
    getEventsForEventType<RepaymentEvent>(
      'repaymentEvents',
      'RepaymentEvent_filter',
      repaymentWhereFilters,
    ),
    getEventsForEventType<LendEvent>(
      'lendEvents',
      'LendEvent_filter',
      lendWhereFilters,
    ),
  ]);

  return groupBy(allEventLoans.flat(), (event) => event.__typename?.toString());
}
