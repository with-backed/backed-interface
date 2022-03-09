import { nftBackedLoansClient } from './urql';
import {
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

export async function subgraphEventFromTxHash(
  eventName: RawEventNameType,
  txHash: string,
): Promise<RawSubgraphEvent | undefined | null> {
  switch (eventName) {
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
        // TODO: bugsnag
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
        // TODO: bugsnag
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
        // TODO: bugsnag
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
        // TODO: bugsnag
      }
      return collateralSeizureEventData?.collateralSeizureEvent;
    default:
      return null;
  }
}
