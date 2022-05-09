import { SQS } from 'aws-sdk';
import { awsConfig } from 'lib/aws/config';
import { NetworkName } from 'lib/config';
import { RawEventNameType } from 'types/RawEvent';

export type FormattedNotificationEventMessageType = {
  eventName: RawEventNameType;
  txHash: string;
  receiptHandle: string;
  network: NetworkName;
};

export async function receiveMessages(): Promise<
  FormattedNotificationEventMessageType[] | undefined
> {
  const queueUrl = process.env.EVENTS_SQS_URL!;
  const sqs = new SQS(awsConfig);

  const response = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();
  return response.Messages?.map((message) => {
    const messageBody: {
      txHash: string;
      eventName: RawEventNameType;
      network: NetworkName;
    } = JSON.parse(message.Body!);
    return {
      ...messageBody,
      receiptHandle: message.ReceiptHandle!,
    };
  });
}

export function deleteMessage(receiptHandle: string) {
  const queueUrl = process.env.EVENTS_SQS_URL!;
  const sqs = new SQS(awsConfig);

  sqs.deleteMessage(
    { QueueUrl: queueUrl, ReceiptHandle: receiptHandle },
    (err, _) => {
      if (err) {
        console.error(err);
      }
    },
  );
}
