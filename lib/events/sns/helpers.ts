import { SNS } from 'aws-sdk';
import { awsConfig } from 'lib/aws/config';
import { NextApiResponse } from 'next';
import { LendEvent as RawSubgraphLendEvent } from 'types/generated/graphql/nftLoans';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';

export type EventsSNSMessage = {
  eventName: RawEventNameType;
  event: RawSubgraphEvent;
  mostRecentTermsEvent?: RawSubgraphLendEvent;
};

export async function pushEventForProcessing({
  eventName,
  event,
  mostRecentTermsEvent,
}: EventsSNSMessage): Promise<boolean> {
  const sns = new SNS(awsConfig);

  const res = await sns
    .publish({
      TopicArn: process.env.EVENTS_SNS_ARN!,
      Message: JSON.stringify({
        eventName,
        event,
        mostRecentTermsEvent,
      }),
    })
    .promise();

  return !res.$response.error;
}

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
