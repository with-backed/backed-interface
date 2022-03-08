import { subgraphEventFromTxHash } from 'lib/eventsHelpers';
import { pushEventForProcessing } from '../sns/helpers';
import { deleteMessage, receiveMessages } from './helpers';

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
        // if push to SNS succeeded, delete from SQS queue, if push to SNS failed, do nothing, and we will process this message again on next run
        const pushToSnsSuccess = await pushEventForProcessing({
          eventName: message.eventName,
          event,
          txHash: message.txHash,
        });
        if (pushToSnsSuccess) deleteMessage(message.receiptHandle);
      }
    }

    notificationEventMessages = await receiveMessages();
  }
}
