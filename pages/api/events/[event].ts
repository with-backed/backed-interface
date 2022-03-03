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

      const { data: buyoutEventData } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();

      if (!!buyoutEventData?.buyoutEvent) {
        res
          .status(200)
          .json('buyout emails will already be sent, no need for lend emails');
        return;
      }

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
