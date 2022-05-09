import { NetworkName } from 'lib/config';
import { NextApiResponse } from 'next';
import { LendEvent as RawSubgraphLendEvent } from 'types/generated/graphql/nftLoans';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';

export type EventsSNSMessage = {
  eventName: RawEventNameType;
  event: RawSubgraphEvent;
  network: NetworkName;
  mostRecentTermsEvent?: RawSubgraphLendEvent;
};

export async function confirmTopicSubscription(
  body: any,
  res: NextApiResponse<string>,
): Promise<boolean> {
  if ('SubscribeURL' in body) {
    try {
      await fetch(body['SubscribeURL'], {
        method: 'GET',
      });
      res.status(200).send('subscription successful');
    } catch (e) {
      res.status(400).send('subscription unsuccessful');
    }
    return true;
  } else {
    return false;
  }
}
