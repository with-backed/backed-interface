import {
  BuyoutEvent_OrderBy,
  Loan,
  Loan_Filter,
  Loan_OrderBy,
  OrderDirection,
  QueryLoansArgs,
  AllLoansQuery,
  AllLoansDocument,
  CollateralSeizureEvent_OrderBy,
  RepaymentEvent_OrderBy,
  LendEvent_OrderBy,
  CreateEvent_OrderBy,
  CloseEvent_OrderBy,
  CreateAndCloseQuery,
  CreateAndCloseDocument,
  MostEventsQuery,
  MostEventsDocument,
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
import { OperationResult } from 'urql';

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

  const results = await Promise.all([
    nftBackedLoansClient
      .query<AllLoansQuery>(AllLoansDocument, queryArgsAsBorrower)
      .toPromise(),
    nftBackedLoansClient
      .query<AllLoansQuery>(AllLoansDocument, queryArgsAsLender)
      .toPromise(),
  ]);

  return results
    .map((result) => {
      if (result.error) {
        // TODO: bugsnag
      }
      return result.data ? result.data.loans : [];
    })
    .flat();
}

export async function getAllEventsForAddress(
  address: string,
): Promise<Dictionary<Event[]>> {
  const c = nftBackedLoansClient;
  const whereBorrower = { borrowTicketHolder: address };
  const whereLender = { lendTicketHolder: address };
  const queries = await Promise.all([
    // Events where I have created or closed a loan.
    c
      .query<CreateAndCloseQuery>(CreateAndCloseDocument, {
        orderDirection: OrderDirection.Desc,
        createWhere: { creator: address },
        createOrderBy: CreateEvent_OrderBy.Timestamp,
        closeWhere: { closer: address },
        closeOrderBy: CloseEvent_OrderBy.Timestamp,
      })
      .toPromise(),
    // Events where I am the lender.
    c
      .query<MostEventsQuery>(MostEventsDocument, {
        orderDirection: OrderDirection.Desc,
        buyoutWhere: whereLender,
        buyoutOrderBy: BuyoutEvent_OrderBy.Timestamp,
        collateralWhere: whereLender,
        collateralOrderBy: CollateralSeizureEvent_OrderBy.Timestamp,
        repaymentWhere: whereLender,
        repaymentOrderBy: RepaymentEvent_OrderBy.Timestamp,
        lendWhere: { lender: address },
        lendOrderBy: LendEvent_OrderBy.Timestamp,
      })
      .toPromise(),
    // Events where I am the borrower.
    c
      .query<MostEventsQuery>(MostEventsDocument, {
        orderDirection: OrderDirection.Desc,
        buyoutWhere: { newLender: address },
        buyoutOrderBy: BuyoutEvent_OrderBy.Timestamp,
        collateralWhere: whereBorrower,
        collateralOrderBy: CollateralSeizureEvent_OrderBy.Timestamp,
        repaymentWhere: whereBorrower,
        repaymentOrderBy: RepaymentEvent_OrderBy.Timestamp,
        lendWhere: whereBorrower,
        lendOrderBy: LendEvent_OrderBy.Timestamp,
      })
      .toPromise(),
  ]);

  let events: Event[] = [];

  queries.forEach((q) => {
    if (q.error) {
      // TODO: bugsnag
      console.error(q.error);
    }

    if (q.data) {
      if ((q.data as any).createEvents) {
        const { data } = q as OperationResult<CreateAndCloseQuery>;
        data?.closeEvents.forEach((event) => {
          events.push(
            closeEventToUnified(
              // TODO: @cnasc, instead of `any` we should be able to use the Event type
              // we've actually pulled from the graph. Right now the loan fields are
              // incompatible.
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
        data?.createEvents.forEach((event) => {
          events.push(
            createEventToUnified(
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
      } else {
        const { data } = q as OperationResult<MostEventsQuery>;
        data?.buyoutEvents.forEach((event) => {
          events.push(
            buyoutEventToUnified(
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
        data?.collateralSeizureEvents.forEach((event) => {
          events.push(
            collateralSeizureEventToUnified(
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
        data?.lendEvents.forEach((event) => {
          events.push(
            lendEventToUnified(
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
        data?.repaymentEvents.forEach((event) => {
          events.push(
            repaymentEventToUnified(
              event as any,
              ethers.BigNumber.from(event.loan.id),
            ),
          );
        });
      }
    }
  });

  return groupBy(events, (event) => event.typename);
}
