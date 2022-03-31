import { SNS } from 'aws-sdk';
import { awsConfig } from 'lib/aws/config';
import { EventsSNSMessage } from 'lib/events/sns/helpers';

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
