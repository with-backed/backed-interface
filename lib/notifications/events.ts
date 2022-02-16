import { EventFilter } from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { nftBackedLoansClient } from 'lib/urql';
import { gql } from 'urql';

function eventsQuery(eventName: string, properties: string) {
  return gql`
      query($id: String) {
        ${eventName}(id: $id) {
          ${properties}
        }
      }
    `;
}

export async function getEventFromTxHash<T>(
  txHash: string,
  eventName: string,
  properties: string,
): Promise<T> {
  const where: EventFilter[] = [
    {
      id: txHash as string,
    },
  ];

  const graphResponse = await nftBackedLoansClient
    .query(eventsQuery(eventName, properties), {
      where,
    })
    .toPromise();

  return graphResponse.data[eventName] as T;
}
