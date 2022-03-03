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
import { NotificationEventTrigger } from '../shared';
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

      if (message.eventName === NotificationEventTrigger.BuyoutEventOldLender) {
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
      } else if (
        message.eventName === NotificationEventTrigger.BuyoutEventBorrower
      ) {
        const { data } = await nftBackedLoansClient
          .query<BuyoutByTransactionHashQuery>(
            BuyoutByTransactionHashDocument,
            {
              id: message.txHash,
            },
          )
          .toPromise();

        event = data?.buyoutEvent;
        involvedAddress = event?.loan.borrowTicketHolder;
      } else if (message.eventName === NotificationEventTrigger.LendEvent) {
        const lendAndBuyoutEvents = await Promise.all([
          await nftBackedLoansClient
            .query<LendByTransactionHashQuery>(LendByTransactionHashDocument, {
              id: message.txHash,
            })
            .toPromise(),
          await nftBackedLoansClient
            .query<BuyoutByTransactionHashQuery>(
              BuyoutByTransactionHashDocument,
              {
                id: message.txHash,
              },
            )
            .toPromise(),
        ]);

        // buyoutEvent already exists, no need to publish to SNS
        if (!!lendAndBuyoutEvents[1].data?.buyoutEvent) {
          deleteMessage(message.receiptHandle);
          continue;
        }

        event = lendAndBuyoutEvents[0].data?.lendEvent;
        involvedAddress = event?.borrowTicketHolder;
      } else if (
        message.eventName === NotificationEventTrigger.RepaymentEvent
      ) {
        const { data } = await nftBackedLoansClient
          .query<RepaymentEventByTransactionHashQuery>(
            RepaymentEventByTransactionHashDocument,
            { id: message.txHash },
          )
          .toPromise();
        event = data?.repaymentEvent;
        involvedAddress = event?.lendTicketHolder;
      } else if (
        message.eventName === NotificationEventTrigger.CollateralSeizureEvent
      ) {
        const { data } = await nftBackedLoansClient
          .query<CollateralSeizureEventByTransactionHashQuery>(
            CollateralSeizureEventByTransactionHashDocument,
            { id: message.txHash },
          )
          .toPromise();
        event = data?.collateralSeizureEvent;
        involvedAddress = event?.borrowTicketHolder;
      } else {
        continue;
      }

      if (!!event) {
        pushEventForProcessing(involvedAddress, event.loan);
        deleteMessage(message.receiptHandle);
      }
    }

    notificationEventMessages = await receiveMessages();
  }
}
