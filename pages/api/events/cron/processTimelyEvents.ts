import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails/emails';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { captureException, withSentry } from '@sentry/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    console.log(
      `running notifications cron job with timestamp ${currentTimestamp}`,
    );

    const { liquidationOccurringLoans, liquidationOccurredLoans } =
      await getLiquidatedLoansForTimestamp(currentTimestamp);

    console.log({ liquidationOccurringLoans, liquidationOccurredLoans });

    for (
      let loanIndex = 0;
      loanIndex < liquidationOccurringLoans.length;
      loanIndex++
    ) {
      await sendEmailsForTriggerAndEntity(
        'LiquidationOccurring',
        liquidationOccurringLoans[loanIndex],
        currentTimestamp,
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
        currentTimestamp,
      );
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
