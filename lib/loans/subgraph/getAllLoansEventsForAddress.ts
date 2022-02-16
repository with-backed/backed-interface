import {
  ALL_LOAN_PROPERTIES,
  BUYOUT_EVENT_PROPERTIES,
  CLOSE_EVENT_PROPERTIES,
  COLLATERAL_SEIZURE_EVENT_PROPERTIES,
  CREATE_EVENT_PROPERTIES,
  LEND_EVENT_PROPERTIES,
  REPAY_EVENT_PROPERTIES,
} from './subgraphSharedConstants';
import {
  BuyoutEvent,
  BuyoutEvent_Filter,
  BuyoutEvent_OrderBy,
  CreateEvent,
  CloseEvent_Filter,
  CollateralSeizureEvent,
  CollateralSeizureEvent_Filter,
  CreateEvent_Filter,
  LendEvent,
  LendEvent_Filter,
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
  QueryCreateEventsArgs,
  QueryCloseEventsArgs,
} from 'types/generated/graphql/nftLoans';
import { nftBackedLoansClient } from '../../urql';
import { gql } from 'urql';
import { Dictionary, groupBy } from 'lodash';
import { Event } from 'types/Event';
import {
  buyoutEventToUnified,
  closeEventToUnified,
  collateralSeizureEventToUnified,
  createEventToUnified,
  lendEventToUnified,
  repaymentEventToUnified,
} from 'lib/eventTransformers';

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

type EventFilter =
  | CreateEvent_Filter
  | CloseEvent_Filter
  | BuyoutEvent_Filter
  | CollateralSeizureEvent_Filter
  | RepaymentEvent_Filter
  | LendEvent_Filter;

type EventQueryArgs =
  | QueryCreateEventsArgs
  | QueryCloseEventsArgs
  | QueryBuyoutEventsArgs
  | QueryCollateralSeizureEventsArgs
  | QueryRepaymentEventsArgs
  | QueryLendEventsArgs;

function eventsQuery(
  eventName: string,
  whereFilterType: string,
  properties: string,
) {
  return gql`
    query($where: ${whereFilterType}, $first: Int, $orderBy: String, $orderDirection: String) {
      ${eventName}(
        where: $where,
        orderBy: $orderBy, 
        orderDirection: $orderDirection
      ) {
        ${properties}
      }
    }
  `;
}

async function getEventsForEventType<T>(
  eventQueryname: string,
  eventFilterType: string,
  properties: string,
  whereArgs: EventFilter[],
  toUnified: (event: any) => Event,
): Promise<Event[]> {
  const sharedQueryArgs: EventQueryArgs = {
    orderBy: BuyoutEvent_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  };

  const resultArray: { data?: { [eventQueryname: string]: T[] } }[] =
    await Promise.all(
      whereArgs.map((where) =>
        nftBackedLoansClient
          .query(eventsQuery(eventQueryname, eventFilterType, properties), {
            ...sharedQueryArgs,
            where,
          })
          .toPromise(),
      ),
    );

  return resultArray
    .map((result) => (result.data ? result.data[eventQueryname] : []))
    .flat()
    .map((event) => toUnified(event));
}

export async function getAllEventsForAddress(
  address: string,
): Promise<Dictionary<[Event, ...Event[]]>> {
  const buyoutWhereFilters: BuyoutEvent_Filter[] = [
    { newLender: address },
    { lendTicketHolder: address },
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

  const createWhereFilters: CreateEvent_Filter[] = [{ creator: address }];

  const closeWhereFilters: CloseEvent_Filter[] = [{ closer: address }];

  const allEventLoans = await Promise.all([
    getEventsForEventType<BuyoutEvent>(
      'buyoutEvents',
      'BuyoutEvent_filter',
      BUYOUT_EVENT_PROPERTIES,
      buyoutWhereFilters,
      buyoutEventToUnified,
    ),
    getEventsForEventType<CollateralSeizureEvent>(
      'collateralSeizedEvents',
      'CollateralSeizureEvent_filter',
      COLLATERAL_SEIZURE_EVENT_PROPERTIES,
      collateralSeizedWhereFilters,
      collateralSeizureEventToUnified,
    ),
    getEventsForEventType<RepaymentEvent>(
      'repaymentEvents',
      'RepaymentEvent_filter',
      REPAY_EVENT_PROPERTIES,
      repaymentWhereFilters,
      repaymentEventToUnified,
    ),
    getEventsForEventType<LendEvent>(
      'lendEvents',
      'LendEvent_filter',
      LEND_EVENT_PROPERTIES,
      lendWhereFilters,
      lendEventToUnified,
    ),
    getEventsForEventType<CreateEvent>(
      'createEvents',
      'CreateEvent_filter',
      CREATE_EVENT_PROPERTIES,
      createWhereFilters,
      createEventToUnified,
    ),
    getEventsForEventType<CloseEvent>(
      'closeEvents',
      'closeEvent_filter',
      CLOSE_EVENT_PROPERTIES,
      closeWhereFilters,
      closeEventToUnified,
    ),
  ]);

  return groupBy(allEventLoans.flat(), (event) => event.typename);
}
