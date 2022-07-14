import { clientFromUrl } from 'lib/urql';
import {
  CreateByTransactionHashDocument,
  CreateByTransactionHashQuery,
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  CollateralSeizureEventByTransactionHashDocument,
  CollateralSeizureEventByTransactionHashQuery,
  LendByTransactionHashDocument,
  LendByTransactionHashQuery,
  RepaymentEventByTransactionHashDocument,
  RepaymentEventByTransactionHashQuery,
  AllBuyoutEventsQuery,
  AllBuyoutEventsDocument,
  BuyoutEvent_Filter,
  CreateEvent_Filter,
  AllCreateEventsQuery,
  AllCreateEventsDocument,
  LendEvent_Filter,
  AllLendEventsQuery,
  AllLendEventsDocument,
  RepaymentEvent_Filter,
  AllRepaymentEventsQuery,
  AllRepaymentEventsDocument,
  CollateralSeizureEvent_Filter,
  AllCollateralSeizureEventsQuery,
  AllCollateralSeizureEventsDocument,
  LendEvent_OrderBy,
  MostEventsQuery,
  MostEventsDocument,
  OrderDirection,
} from 'types/generated/graphql/nftLoans';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';
import { captureException } from '@sentry/nextjs';
import { Config } from 'lib/config';

export async function subgraphEventFromTxHash(
  config: Config,
  eventName: RawEventNameType,
  txHash: string,
): Promise<RawSubgraphEvent | undefined | null> {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  switch (eventName) {
    case 'CreateEvent':
      const { data: createEventData, error: createEventError } =
        await nftBackedLoansClient
          .query<CreateByTransactionHashQuery>(
            CreateByTransactionHashDocument,
            {
              id: txHash,
            },
          )
          .toPromise();
      if (createEventError) {
        captureException(createEventError);
      }
      return createEventData?.createEvent;
    case 'BuyoutEvent':
      const { data: buyoutEventData, error: buyoutEventError } =
        await nftBackedLoansClient
          .query<BuyoutByTransactionHashQuery>(
            BuyoutByTransactionHashDocument,
            {
              id: txHash,
            },
          )
          .toPromise();
      if (buyoutEventError) {
        captureException(buyoutEventError);
      }
      return buyoutEventData?.buyoutEvent;
    case 'LendEvent':
      const { data: lendEventData, error: lendEventError } =
        await nftBackedLoansClient
          .query<LendByTransactionHashQuery>(LendByTransactionHashDocument, {
            id: txHash,
          })
          .toPromise();
      if (lendEventError) {
        captureException(lendEventError);
      }
      return lendEventData?.lendEvent;
    case 'RepaymentEvent':
      const { data: repayEventData, error: repayEventError } =
        await nftBackedLoansClient
          .query<RepaymentEventByTransactionHashQuery>(
            RepaymentEventByTransactionHashDocument,
            { id: txHash },
          )
          .toPromise();
      if (repayEventError) {
        captureException(repayEventError);
      }
      return repayEventData?.repaymentEvent;
    case 'CollateralSeizureEvent':
      const {
        data: collateralSeizureEventData,
        error: collateralSeizureEventError,
      } = await nftBackedLoansClient
        .query<CollateralSeizureEventByTransactionHashQuery>(
          CollateralSeizureEventByTransactionHashDocument,
          { id: txHash },
        )
        .toPromise();
      if (collateralSeizureEventError) {
        captureException(collateralSeizureEventError);
      }
      return collateralSeizureEventData?.collateralSeizureEvent;
    default:
      return null;
  }
}

export async function getCreateEventsSince(config: Config, timestamp: number) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: CreateEvent_Filter = {
    timestamp_gte: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllCreateEventsQuery>(AllCreateEventsDocument, { where })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.createEvents || [];
}

export async function getLendEventsSince(config: Config, timestamp: number) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: LendEvent_Filter = {
    timestamp_gte: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllLendEventsQuery>(AllLendEventsDocument, { where })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.lendEvents || [];
}

export async function getBuyoutEventsSince(config: Config, timestamp: number) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: BuyoutEvent_Filter = {
    timestamp_gte: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllBuyoutEventsQuery>(AllBuyoutEventsDocument, { where })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.buyoutEvents || [];
}

export async function getRepaymentEventsSince(
  config: Config,
  timestamp: number,
) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: RepaymentEvent_Filter = {
    timestamp_gte: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllRepaymentEventsQuery>(AllRepaymentEventsDocument, { where })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.repaymentEvents || [];
}

export async function getCollateralSeizureEventsSince(
  config: Config,
  timestamp: number,
) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: CollateralSeizureEvent_Filter = {
    timestamp_gte: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllCollateralSeizureEventsQuery>(
      AllCollateralSeizureEventsDocument,
      { where },
    )
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.collateralSeizureEvents || [];
}

export async function getOldestLendEventForUser(config: Config, user: string) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: LendEvent_Filter = {
    lender: user,
  };

  const { data, error } = await nftBackedLoansClient
    .query<MostEventsQuery>(MostEventsDocument, {
      lendWhere: where,
      first: 1,
      lendOrderBy: LendEvent_OrderBy.Timestamp,
      orderDirection: OrderDirection.Desc,
    })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.lendEvents[0] || null;
}

export async function getOldestRepaymentEventForUser(
  config: Config,
  user: string,
) {
  const nftBackedLoansClient = clientFromUrl(config.nftBackedLoansSubgraph);

  const where: RepaymentEvent_Filter = {
    repayer: user,
  };

  const { data, error } = await nftBackedLoansClient
    .query<MostEventsQuery>(MostEventsDocument, {
      repaymentWhere: where,
      first: 1,
      repaymentOrderBy: LendEvent_OrderBy.Timestamp,
      orderDirection: OrderDirection.Desc,
    })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.repaymentEvents[0] || null;
}
