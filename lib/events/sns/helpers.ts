import { SNS } from 'aws-sdk';
import { NextApiResponse } from 'next';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';

const snsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AMAZON_WEB_SERVICES_ACCESS_KEY!,
    secretAccessKey: process.env.AMAZON_WEB_SERVICES_SECRET_KEY!,
  },
};

export type EventsSNSMessage = {
  eventName: RawEventNameType;
  event: RawSubgraphEvent;
  txHash: string;
};

//TODO(adamgobes): fill this out with actual pushing of message to SNS -- to be implemented in follow up PR
export async function pushEventForProcessing({
  eventName,
  event,
  txHash,
}: EventsSNSMessage): Promise<boolean> {
  const sns = new SNS(snsConfig);

  const res = await sns
    .publish({
      TopicArn: process.env.EVENTS_SNS_ARN!,
      Message: JSON.stringify({
        eventName,
        txHash,
        event,
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
