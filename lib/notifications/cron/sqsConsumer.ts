import {
  BUYOUT_EVENT_PROPERTIES,
  COLLATERAL_SEIZURE_EVENT_PROPERTIES,
  LEND_EVENT_PROPERTIES,
  REPAY_EVENT_PROPERTIES,
} from 'lib/loans/subgraph/subgraphSharedConstants';
import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { getEventFromTxHash } from '../events';
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
        | CollateralSeizureEvent;

      if (message.eventName === NotificationEventTrigger.BuyoutEventOldLender) {
        event = await getEventFromTxHash<BuyoutEvent>(
          message.txHash,
          'buyoutEvent',
          BUYOUT_EVENT_PROPERTIES,
        );
      } else if (
        message.eventName === NotificationEventTrigger.BuyoutEventBorrower
      ) {
        event = await getEventFromTxHash<BuyoutEvent>(
          message.txHash,
          'buyoutEvent',
          BUYOUT_EVENT_PROPERTIES,
        );
      } else if (message.eventName === NotificationEventTrigger.LendEvent) {
        event = await getEventFromTxHash<LendEvent>(
          message.txHash,
          'lendEvent',
          LEND_EVENT_PROPERTIES,
        );
      } else if (
        message.eventName === NotificationEventTrigger.RepaymentEvent
      ) {
        event = await getEventFromTxHash<RepaymentEvent>(
          message.txHash,
          'repaymentEvent',
          REPAY_EVENT_PROPERTIES,
        );
      } else if (
        message.eventName === NotificationEventTrigger.CollateralSeizureEvent
      ) {
        event = await getEventFromTxHash<CollateralSeizureEvent>(
          message.txHash,
          'collateralSeizureEvent',
          COLLATERAL_SEIZURE_EVENT_PROPERTIES,
        );
      } else {
        continue;
      }

      if (!!event) {
        pushEventForProcessing(event.loan);
        deleteMessage(message.receiptHandle);
      }
    }

    notificationEventMessages = await receiveMessages();
  }
}
