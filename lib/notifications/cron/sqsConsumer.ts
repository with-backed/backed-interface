import { subgraphEventFromTxHash } from 'lib/eventsHelpers';
import { pushEventForProcessing } from '../sns';
import { deleteMessage, receiveMessages } from '../sqs';

export async function main() {
  let notificationEventMessages = await receiveMessages();
  while (!!notificationEventMessages) {
    for (let i = 0; i < notificationEventMessages.length; i++) {
      const message = notificationEventMessages[i];

      // we check to see if event exists cause graph may not be in sync by the time our SQS consumer runs
      // if graph is not yet in sync, skip
      // if graph is in sync and event exists, push to SNS for consumption by bots/email APIs and delete message from SQS queue
      const event = await subgraphEventFromTxHash(
        message.eventName,
        message.txHash,
      );
      if (!!event) {
        pushEventForProcessing(event.loan);
        deleteMessage(message.receiptHandle);
      }
    }

    notificationEventMessages = await receiveMessages();
  }
}
