import { SQS } from 'aws-sdk';
import { EventAsStringType } from 'types/Event';

const sqsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

export type FormattedNotificationEventMessageType = {
  eventName: EventAsStringType;
  txHash: string;
  receiptHandle: string;
};

export async function receiveMessages(): Promise<
  FormattedNotificationEventMessageType[] | undefined
> {
  const queueUrl = process.env.SQS_NOTIFICATIONS_EVENTS_URL!;
  const sqs = new SQS(sqsConfig);

  const response = await sqs
    .receiveMessage({ QueueUrl: queueUrl, MessageAttributeNames: ['All'] })
    .promise();
  return response.Messages?.map((message) => ({
    eventName: message.MessageAttributes!['EventName']
      .StringValue! as EventAsStringType,
    txHash: message.Body!,
    receiptHandle: message.ReceiptHandle!,
  }));
}

export function deleteMessage(receiptHandle: string) {
  const queueUrl = process.env.SQS_NOTIFICATIONS_EVENTS_URL!;
  const sqs = new SQS(sqsConfig);

  sqs.deleteMessage(
    { QueueUrl: queueUrl, ReceiptHandle: receiptHandle },
    (err, _) => {
      if (err) {
        console.error(err);
      }
    },
  );
}
