import { NextApiRequest, NextApiResponse } from 'next';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationTriggerType } from 'lib/notifications/shared';
import { Loan } from 'types/generated/graphql/nftLoans';
import { NotificationRequest } from '@prisma/client';
import { getLiquidatedLoansForTimestamp } from 'lib/events/cron/timely';

// TODO(adamgobes): Rename this API route to be more specific to liquidations
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const currentTimestamp = new Date().getTime() / 1000;
    console.log(
      `running notifications cron job with timestamp ${currentTimestamp}`,
    );

    const { liquidationOccurringLoans, liquidationOccurredLoans } =
      await getLiquidatedLoansForTimestamp(currentTimestamp);

    for (let i = 0; i < liquidationOccurringLoans.length; i++) {
      const loan = liquidationOccurringLoans[i];
      const notificationRequestsBorrower =
        await getNotificationRequestsForAddress(loan.borrowTicketHolder);
      for (let i = 0; i < notificationRequestsBorrower.length; i++) {
        await sendEmail(
          notificationRequestsBorrower[i].deliveryDestination,
          'LiquidationOccurringBorrower',
          loan,
        );
      }

      const notificationRequestsLender =
        await getNotificationRequestsForAddress(loan.lendTicketHolder);
      for (let i = 0; i < notificationRequestsBorrower.length; i++) {
        await sendEmail(
          notificationRequestsLender[i].deliveryDestination,
          'LiquidationOccurringLender',
          loan,
        );
      }
    }

    for (let i = 0; i < liquidationOccurredLoans.length; i++) {
      const loan = liquidationOccurredLoans[i];
      const notificationRequestsBorrower =
        await getNotificationRequestsForAddress(loan.borrowTicketHolder);
      for (let i = 0; i < notificationRequestsBorrower.length; i++) {
        await sendEmail(
          notificationRequestsBorrower[i].deliveryDestination,
          'LiquidationOccurredBorrower',
          loan,
        );
      }

      const notificationRequestsLender =
        await getNotificationRequestsForAddress(loan.lendTicketHolder);
      for (let i = 0; i < notificationRequestsBorrower.length; i++) {
        await sendEmail(
          notificationRequestsLender[i].deliveryDestination,
          'LiquidationOccurredLender',
          loan,
        );
      }
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
