import { nftBackedLoansClient } from './urql';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  BuyoutEvent,
  CollateralSeizureEvent,
  CollateralSeizureEventByTransactionHashDocument,
  CollateralSeizureEventByTransactionHashQuery,
  LendByTransactionHashDocument,
  LendByTransactionHashQuery,
  LendEvent,
  RepaymentEvent,
  RepaymentEventByTransactionHashDocument,
  RepaymentEventByTransactionHashQuery,
} from 'types/generated/graphql/nftLoans';
import { EventAsStringType } from 'types/Event';

export async function subgraphEventFromTxHash(
  eventName: EventAsStringType,
  txHash: string,
): Promise<
  | BuyoutEvent
  | LendEvent
  | RepaymentEvent
  | CollateralSeizureEvent
  | undefined
  | null
> {
  switch (eventName) {
    case 'BuyoutEvent':
      const { data: buyoutEventData } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();
      return buyoutEventData?.buyoutEvent;
    case 'LendEvent':
      const { data: lendEventData } = await nftBackedLoansClient
        .query<LendByTransactionHashQuery>(LendByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();
      return lendEventData?.lendEvent;
    case 'RepaymentEvent':
      const { data: repayEventData } = await nftBackedLoansClient
        .query<RepaymentEventByTransactionHashQuery>(
          RepaymentEventByTransactionHashDocument,
          { id: txHash },
        )
        .toPromise();
      return repayEventData?.repaymentEvent;
    case 'CollateralSeizureEvent':
      const { data: collateralSeizureEventData } = await nftBackedLoansClient
        .query<CollateralSeizureEventByTransactionHashQuery>(
          CollateralSeizureEventByTransactionHashDocument,
          { id: txHash },
        )
        .toPromise();
      return collateralSeizureEventData?.collateralSeizureEvent;
    default:
      return null;
  }
}
