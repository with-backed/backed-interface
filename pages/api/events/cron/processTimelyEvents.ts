import { NextApiRequest, NextApiResponse } from 'next';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import { NotificationTriggerType } from 'lib/events/consumers/userNotifications/shared';
import { Loan } from 'types/generated/graphql/nftLoans';
import { NotificationRequest } from '@prisma/client';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';

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
      await sendEmailsForTriggerAndEntity(
        'LiquidationOccurring',
        liquidationOccurringLoans[loanIndex],
      );
    }

    for (
      let loanIndex = 0;
      loanIndex < liquidationOccurredLoans.length;
      loanIndex++
    ) {
      await sendEmailsForTriggerAndEntity(
        'LiquidationOccurred',
        liquidationOccurredLoans[loanIndex],
      );
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
