import { NextApiRequest, NextApiResponse } from 'next';
import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import {
  BUYOUT_EVENT_PROPERTIES,
  COLLATERAL_SEIZURE_EVENT_PROPERTIES,
  LEND_EVENT_PROPERTIES,
  REPAY_EVENT_PROPERTIES,
} from 'lib/loans/subgraph/subgraphSharedConstants';
import { getEventFromTxHash } from 'lib/notifications/events';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationEventTrigger } from 'lib/notifications/shared';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { event } = req.query as { event: NotificationEventTrigger };
    const { txHash } = req.body;

    let involvedAddress: string;
    let loan: Loan;

    if (event === NotificationEventTrigger.BuyoutEventOldLender) {
      const event = await getEventFromTxHash<BuyoutEvent>(
        txHash as string,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );
      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.BuyoutEventBorrower) {
      const event = await getEventFromTxHash<BuyoutEvent>(
        txHash as string,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );
      involvedAddress = event.loan.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.LendEvent) {
      const event = await getEventFromTxHash<LendEvent>(
        txHash as string,
        'lendEvent',
        LEND_EVENT_PROPERTIES,
      );
      involvedAddress = event.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.RepaymentEvent) {
      const event = await getEventFromTxHash<RepaymentEvent>(
        txHash as string,
        'repaymentEvent',
        REPAY_EVENT_PROPERTIES,
      );
      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.CollateralSeizureEvent) {
      const event = await getEventFromTxHash<CollateralSeizureEvent>(
        txHash as string,
        'collateralSeizureEvent',
        COLLATERAL_SEIZURE_EVENT_PROPERTIES,
      );
      involvedAddress = event.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else {
      res.status(400).send('invalid event name passed to POST /events/[event]');
      return;
    }

    const notificationRequests = await getNotificationRequestsForAddress(
      involvedAddress,
    );

    for (let i = 0; i < notificationRequests.length; i++) {
      sendEmail(notificationRequests[i].deliveryDestination, event, loan);
    }

    res
      .status(200)
      .json(`notifications successfully sent to ${involvedAddress}`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
