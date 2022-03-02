import { NextApiRequest, NextApiResponse } from 'next';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationEventTrigger } from 'lib/notifications/shared';
import { Loan } from 'types/generated/graphql/nftLoans';
import { NotificationRequest } from '@prisma/client';

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
    const { loan } = req.body as { loan: Loan };

    let notificationRequests: NotificationRequest[];

    if (
      event === NotificationEventTrigger.LiquidationOccurringBorrower ||
      event === NotificationEventTrigger.LiquidationOccurredBorrower
    ) {
      notificationRequests = await getNotificationRequestsForAddress(
        loan.borrowTicketHolder,
      );
    } else if (
      event === NotificationEventTrigger.LiquidationOccurringLender ||
      NotificationEventTrigger.LiquidationOccurredLender
    ) {
      notificationRequests = await getNotificationRequestsForAddress(
        loan.lendTicketHolder,
      );
    } else {
      res
        .status(400)
        .send('invalid event name passed to POST /events/cron/[event]');
      return;
    }

    for (let i = 0; i < notificationRequests.length; i++) {
      sendEmail(notificationRequests[i].deliveryDestination, event, loan);
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
