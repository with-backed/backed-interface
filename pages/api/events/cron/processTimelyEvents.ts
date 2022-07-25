import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails/emails';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { captureException, withSentry } from '@sentry/nextjs';
import { Config, devConfigs, prodConfigs } from 'lib/config';
import { overrideLastWrittenTimestamp } from 'lib/events/consumers/userNotifications/repository';

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  let configs: Config[];
  if (process.env.VERCEL_ENV === 'production') {
    configs = prodConfigs;
  } else {
    configs = devConfigs;
  }

  try {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    console.log(
      `running notifications cron job with timestamp ${currentTimestamp}`,
    );

    let newRunTimestamp: number = 0; // guranteed to get reinitialized below, we'll always have at least one config
    for (const config of configs) {
      const {
        liquidationOccurringLoans,
        liquidationOccurredLoans,
        currentRunTimestamp,
      } = await getLiquidatedLoansForTimestamp(
        currentTimestamp,
        config.nftBackedLoansSubgraph,
      );

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
      newRunTimestamp = currentRunTimestamp;
    }

    await overrideLastWrittenTimestamp(newRunTimestamp);

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
