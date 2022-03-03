import {
  BuyoutEvent_Filter,
  BuyoutEvent_OrderBy,
  CloseEvent_Filter,
  CollateralSeizureEvent_Filter,
  CreateEvent_Filter,
  LendEvent_Filter,
  Loan,
  Loan_Filter,
  Loan_OrderBy,
  OrderDirection,
  QueryLoansArgs,
  RepaymentEvent_Filter,
  AllLoansQuery,
  AllLoansDocument,
  AllEventsForAddressQuery,
  AllEventsForAddressDocument,
  CollateralSeizureEvent_OrderBy,
  RepaymentEvent_OrderBy,
  LendEvent_OrderBy,
  CreateEvent_OrderBy,
  CloseEvent_OrderBy,
} from 'types/generated/graphql/nftLoans';
import { nftBackedLoansClient } from '../../urql';
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
import { ethers } from 'ethers';

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
      .query<AllLoansQuery>(AllLoansDocument, queryArgsAsBorrower)
      .toPromise(),
    nftBackedLoansClient
      .query<AllLoansQuery>(AllLoansDocument, queryArgsAsLender)
      .toPromise(),
  ]);

  return resultArray
    .map((result) => (result.data ? result.data.loans : []))
    .flat();
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

  const queryResult = await nftBackedLoansClient
    .query<AllEventsForAddressQuery>(AllEventsForAddressDocument, {
      orderDirection: OrderDirection.Desc,
      buyoutWhere: buyoutWhereFilters,
      buyoutOrderBy: BuyoutEvent_OrderBy.Timestamp,
      collateralWhere: collateralSeizedWhereFilters,
      collateralOrderBy: CollateralSeizureEvent_OrderBy.Timestamp,
      repaymentWhere: repaymentWhereFilters,
      repaymentOrderBy: RepaymentEvent_OrderBy.Timestamp,
      lendWhere: lendWhereFilters,
      lendOrderBy: LendEvent_OrderBy.Timestamp,
      createWhere: createWhereFilters,
      createOrderBy: CreateEvent_OrderBy.Timestamp,
      closeWhere: closeWhereFilters,
      closeOrderBy: CloseEvent_OrderBy.Timestamp,
    })
    .toPromise();

  if (!queryResult.data) {
    return {};
  }

  let events: Event[] = [];

  queryResult.data.buyoutEvents.forEach((event) => {
    // TODO: @cnasc, instead of `any` we should be able to use the Event type
    // we've actually pulled from the graph. Right now the loan fields are
    // incompatible.
    events.push(
      buyoutEventToUnified(event as any, ethers.BigNumber.from(event.loan.id)),
    );
  });
  queryResult.data.closeEvents.forEach((event) => {
    events.push(
      closeEventToUnified(event as any, ethers.BigNumber.from(event.loan.id)),
    );
  });
  queryResult.data.collateralSeizureEvents.forEach((event) => {
    events.push(
      collateralSeizureEventToUnified(
        event as any,
        ethers.BigNumber.from(event.loan.id),
      ),
    );
  });
  queryResult.data.createEvents.forEach((event) => {
    events.push(
      createEventToUnified(event as any, ethers.BigNumber.from(event.loan.id)),
    );
  });
  queryResult.data.lendEvents.forEach((event) => {
    events.push(
      lendEventToUnified(event as any, ethers.BigNumber.from(event.loan.id)),
    );
  });
  queryResult.data.repaymentEvents.forEach((event) => {
    events.push(
      repaymentEventToUnified(
        event as any,
        ethers.BigNumber.from(event.loan.id),
      ),
    );
  });

  return groupBy(events, (event) => event.typename);
}
