import { nftBackedLoansClient } from './urql';
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
} from 'types/generated/graphql/nftLoans';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';
import { captureException } from '@sentry/nextjs';

export async function subgraphEventFromTxHash(
  eventName: RawEventNameType,
  txHash: string,
): Promise<RawSubgraphEvent | undefined | null> {
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
