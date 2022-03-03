import { NextApiRequest, NextApiResponse } from 'next';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  CollateralSeizureEventByTransactionHashDocument,
  CollateralSeizureEventByTransactionHashQuery,
  LendByTransactionHashDocument,
  LendByTransactionHashQuery,
  Loan,
  RepaymentEventByTransactionHashDocument,
  RepaymentEventByTransactionHashQuery,
} from 'types/generated/graphql/nftLoans';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationEventTrigger } from 'lib/notifications/shared';
import { nftBackedLoansClient } from 'lib/urql';

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
<<<<<<< HEAD
      const { data } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();

      const event = data!.buyoutEvent!;
      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.BuyoutEventBorrower) {
      const { data } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();

      const event = data!.buyoutEvent!;
      involvedAddress = event.loan.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.LendEvent) {
      const { data } = await nftBackedLoansClient
        .query<LendByTransactionHashQuery>(LendByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();
      const event = data!.lendEvent!;
      involvedAddress = event.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.RepaymentEvent) {
      const { data } = await nftBackedLoansClient
        .query<RepaymentEventByTransactionHashQuery>(
          RepaymentEventByTransactionHashDocument,
          { id: txHash },
        )
        .toPromise();
      const event = data!.repaymentEvent!;
      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.CollateralSeizureEvent) {
      const { data } = await nftBackedLoansClient
        .query<CollateralSeizureEventByTransactionHashQuery>(
          CollateralSeizureEventByTransactionHashDocument,
          { id: txHash },
        )
        .toPromise();
      const event = data!.collateralSeizureEvent!;
=======
      const event = await getEventFromTxHash<BuyoutEvent>(
        txHash as string,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );

      if (!event) {
        res
          .status(400)
          .send(`could not find event with tx hash ${txHash as string}`);
        return;
      }

      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.BuyoutEventBorrower) {
      const event = await getEventFromTxHash<BuyoutEvent>(
        txHash as string,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );

      if (!event) {
        res
          .status(400)
          .send(`could not find event with tx hash ${txHash as string}`);
        return;
      }

      involvedAddress = event.loan.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.LendEvent) {
      const event = await getEventFromTxHash<LendEvent>(
        txHash as string,
        'lendEvent',
        LEND_EVENT_PROPERTIES,
      );

      if (!event) {
        res
          .status(400)
          .send(`could not find event with tx hash ${txHash as string}`);
        return;
      }

      const buyoutEventWithSameTx = await getEventFromTxHash<BuyoutEvent>(
        txHash as string,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );
      if (!!buyoutEventWithSameTx) {
        res
          .status(200)
          .json('buyout emails will already be sent, no need for lend emails');
        return;
      }
      involvedAddress = event.borrowTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.RepaymentEvent) {
      const event = await getEventFromTxHash<RepaymentEvent>(
        txHash as string,
        'repaymentEvent',
        REPAY_EVENT_PROPERTIES,
      );

      if (!event) {
        res
          .status(400)
          .send(`could not find event with tx hash ${txHash as string}`);
        return;
      }

      involvedAddress = event.lendTicketHolder.toLowerCase();
      loan = event.loan;
    } else if (event === NotificationEventTrigger.CollateralSeizureEvent) {
      const event = await getEventFromTxHash<CollateralSeizureEvent>(
        txHash as string,
        'collateralSeizureEvent',
        COLLATERAL_SEIZURE_EVENT_PROPERTIES,
      );

      if (!event) {
        res
          .status(400)
          .send(`could not find event with tx hash ${txHash as string}`);
        return;
      }

>>>>>>> 2006631... chore: ensure lend event is not part of buyout before sending email
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
