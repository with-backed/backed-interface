import { NextApiRequest, NextApiResponse } from 'next';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationTriggerType } from 'lib/notifications/shared';
import { Loan } from 'types/generated/graphql/nftLoans';
import { NotificationRequest } from '@prisma/client';
import { getLiquidatedLoansForTimestamp } from 'lib/events/cron/timely';

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

    for (
      let loanIndex = 0;
      loanIndex < liquidationOccurringLoans.length;
      loanIndex++
    ) {
      const loan = liquidationOccurringLoans[loanIndex];
      const notificationRequestsBorrower =
        await getNotificationRequestsForAddress(loan.borrowTicketHolder);
      for (
        let notificationIndex = 0;
        notificationIndex < notificationRequestsBorrower.length;
        notificationIndex++
      ) {
        await sendEmail(
          notificationRequestsBorrower[notificationIndex].deliveryDestination,
          'LiquidationOccurringBorrower',
          loan,
        );
      }

      const notificationRequestsLender =
        await getNotificationRequestsForAddress(loan.lendTicketHolder);
      for (
        let notificationIndex = 0;
        notificationIndex < notificationRequestsBorrower.length;
        notificationIndex++
      ) {
        await sendEmail(
          notificationRequestsLender[notificationIndex].deliveryDestination,
          'LiquidationOccurringLender',
          loan,
        );
      }
    }

    for (
      let loanIndex = 0;
      loanIndex < liquidationOccurredLoans.length;
      loanIndex++
    ) {
      const loan = liquidationOccurredLoans[loanIndex];
      const notificationRequestsBorrower =
        await getNotificationRequestsForAddress(loan.borrowTicketHolder);
      for (
        let notificationIndex = 0;
        notificationIndex < notificationRequestsBorrower.length;
        notificationIndex++
      ) {
        await sendEmail(
          notificationRequestsBorrower[notificationIndex].deliveryDestination,
          'LiquidationOccurredBorrower',
          loan,
        );
      }

      const notificationRequestsLender =
        await getNotificationRequestsForAddress(loan.lendTicketHolder);
      for (
        let notificationIndex = 0;
        notificationIndex < notificationRequestsBorrower.length;
        notificationIndex++
      ) {
        await sendEmail(
          notificationRequestsLender[notificationIndex].deliveryDestination,
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
