import { ALL_LOAN_PROPERTIES } from 'lib/loans/subgraph/subgraphSharedConstants';
import { nftBackedLoansClient } from 'lib/urql';
import { gql } from 'urql';

function eventsQuery(eventName: string, properties: string) {
  return gql`
      query($id: String) {
        ${eventName}(id: $id) {
          ${properties}
          loan {
            ${ALL_LOAN_PROPERTIES}
          }
        }
      }
    `;
}

export async function getEventFromTxHash<T>(
  txHash: string,
  eventName: string,
  properties: string,
): Promise<T | null> {
  const graphResponse = await nftBackedLoansClient
    .query<{ [eventName: string]: T }>(eventsQuery(eventName, properties), {
      id: txHash,
    })
    .toPromise();

  if (graphResponse.data?.[eventName]) {
    return graphResponse.data[eventName] as T;
  }

  return null;
}
