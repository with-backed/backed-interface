import { SNS } from 'aws-sdk';
import { RawSubgraphEvent } from 'types/RawEvent';

const snsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

//TODO(adamgobes): fill this out with actual pushing of message to SNS -- to be implemented in follow up PR
export async function pushEventForProcessing(
  eventName: string,
  event: RawSubgraphEvent,
  txHash: string,
): Promise<boolean> {
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
