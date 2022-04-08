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
import Bugsnag from '@bugsnag/js';

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
        Bugsnag.notify(createEventError);
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
        Bugsnag.notify(buyoutEventError);
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
        Bugsnag.notify(lendEventError);
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
        Bugsnag.notify(repayEventError);
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
        Bugsnag.notify(collateralSeizureEventError);
      }
      return collateralSeizureEventData?.collateralSeizureEvent;
    default:
      return null;
  }
}
