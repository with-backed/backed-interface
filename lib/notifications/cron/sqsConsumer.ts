import { nftBackedLoansClient } from 'lib/urql';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  BuyoutEvent,
  CollateralSeizureEvent,
  CollateralSeizureEventByTransactionHashDocument,
  CollateralSeizureEventByTransactionHashQuery,
  LendByTransactionHashDocument,
  LendByTransactionHashQuery,
  LendEvent,
  RepaymentEvent,
  RepaymentEventByTransactionHashDocument,
  RepaymentEventByTransactionHashQuery,
} from 'types/generated/graphql/nftLoans';
import { pushEventForProcessing } from '../sns';
import { deleteMessage, receiveMessages } from '../sqs';

export async function main() {
  let notificationEventMessages = await receiveMessages();
  while (!!notificationEventMessages) {
    for (let i = 0; i < notificationEventMessages.length; i++) {
      const message = notificationEventMessages[i];
      let event:
        | BuyoutEvent
        | LendEvent
        | RepaymentEvent
        | CollateralSeizureEvent
        | undefined
        | null;
      let involvedAddress: string;

      if (message.eventName === 'BuyoutEvent') {
        const { data } = await nftBackedLoansClient
          .query<BuyoutByTransactionHashQuery>(
            BuyoutByTransactionHashDocument,
            {
              id: message.txHash,
            },
          )
          .toPromise();

        event = data?.buyoutEvent;
        involvedAddress = event?.lendTicketHolder;
      } else if (message.eventName === 'LendEvent') {
        const { data } = await nftBackedLoansClient
          .query<LendByTransactionHashQuery>(LendByTransactionHashDocument, {
            id: message.txHash,
          })
          .toPromise();

        event = data?.lendEvent;
        involvedAddress = event?.borrowTicketHolder;
      } else if (message.eventName === 'RepaymentEvent') {
        const { data } = await nftBackedLoansClient
          .query<RepaymentEventByTransactionHashQuery>(
            RepaymentEventByTransactionHashDocument,
            { id: message.txHash },
          )
          .toPromise();
        event = data?.repaymentEvent;
        involvedAddress = event?.lendTicketHolder;
      } else if (message.eventName === 'CollateralSeizureEvent') {
        const { data } = await nftBackedLoansClient
          .query<CollateralSeizureEventByTransactionHashQuery>(
            CollateralSeizureEventByTransactionHashDocument,
            { id: message.txHash },
          )
          .toPromise();
        console.log({ data });
        event = data?.collateralSeizureEvent;
        involvedAddress = event?.borrowTicketHolder;
      } else {
        continue;
      }

      // we check to see if event exists cause graph may not be in sync by the time our SQS consumer runs
      // if graph is not yet in sync, skip
      // if graph is in sync and event exists, push to SNS for consumption by bots/email APIs and delete message from SQS queue
      if (!!event) {
        pushEventForProcessing(involvedAddress, event.loan);
        deleteMessage(message.receiptHandle);
      }
    }

    notificationEventMessages = await receiveMessages();
  }
}
