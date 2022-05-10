import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails/emails';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { captureException, withSentry } from '@sentry/nextjs';
import { Config, devConfigs, prodConfigs } from 'lib/config';
import { onRinkeby } from 'lib/chainEnv';

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  let configs: Config[];
  if (onRinkeby) {
    configs = devConfigs;
  } else {
    configs = prodConfigs;
  }

  try {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    console.log(
      `running notifications cron job with timestamp ${currentTimestamp}`,
    );

    for (const config of configs) {
      const { liquidationOccurringLoans, liquidationOccurredLoans } =
        await getLiquidatedLoansForTimestamp(currentTimestamp, config);

      for (
        let loanIndex = 0;
        loanIndex < liquidationOccurringLoans.length;
        loanIndex++
      ) {
        await sendEmailsForTriggerAndEntity(
          'LiquidationOccurring',
          liquidationOccurringLoans[loanIndex],
          currentTimestamp,
          config,
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
          config,
        );
      }
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
