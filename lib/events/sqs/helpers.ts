import { SQS } from 'aws-sdk';
import { RawEventNameType } from 'types/RawEvent';

const sqsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AMAZON_WEB_SERVICES_ACCESS_KEY!,
    secretAccessKey: process.env.AMAZON_WEB_SERVICES_SECRET_KEY!,
  },
};

export type FormattedNotificationEventMessageType = {
  eventName: RawEventNameType;
  txHash: string;
  receiptHandle: string;
};

export async function receiveMessages(): Promise<
  FormattedNotificationEventMessageType[] | undefined
> {
  const queueUrl = process.env.EVENTS_SQS_URL!;
  const sqs = new SQS(sqsConfig);

  const response = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();
  return response.Messages?.map((message) => {
    const messageBody: { txHash: string; eventName: RawEventNameType } =
      JSON.parse(message.Body!);
    return {
      ...messageBody,
      receiptHandle: message.ReceiptHandle!,
    };
  });
}

export function deleteMessage(receiptHandle: string) {
  const queueUrl = process.env.EVENTS_SQS_URL!;
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
