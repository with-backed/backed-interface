import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import {
  getBuyoutEventsSince,
  getCollateralSeizureEventsSince,
  getLendEventsSince,
  getRepaymentEventsSince,
} from 'lib/eventsHelpers';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { NotificationMethod } from 'lib/events/consumers/userNotifications/shared';
import {
  getBackedMetric,
  Metric,
  resetBackedMetric,
} from 'lib/metrics/repository';
import { subgraphEventFromTxHash } from 'lib/eventsHelpers';
import dayjs from 'dayjs';
import { GenericEmailComponents } from 'lib/events/consumers/userNotifications/emails/genericFormatter';
import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/emails/ses';
import { generateHTMLForGenericEmail } from 'lib/events/consumers/userNotifications/emails/mjml';
import { Config, devConfigs, prodConfigs } from 'lib/config';

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
    const dayAgo = currentTimestamp - 24 * 3600;

    for (const config of configs) {
      const lendEventsAddresses = (await getLendEventsSince(config, dayAgo))
        .filter(
          (lendEvent) =>
            !subgraphEventFromTxHash(config, 'BuyoutEvent', lendEvent.id),
        )
        .map((e) => [e.lender, e.borrowTicketHolder])
        .flat();

      const buyoutEventsAddresses = (await getBuyoutEventsSince(config, dayAgo))
        .map((e) => [
          e.loan.borrowTicketHolder,
          e.newLender,
          e.lendTicketHolder,
        ])
        .flat();

      const repaymentEventAddresses = (
        await getRepaymentEventsSince(config, dayAgo)
      )
        .map((e) => [e.lendTicketHolder, e.borrowTicketHolder])
        .flat();

      const collateralSeizureAddresses = (
        await getCollateralSeizureEventsSince(config, dayAgo)
      )
        .map((e) => [e.borrowTicketHolder, e.lendTicketHolder])
        .flat();

      const expectedNumEmails = (
        await Promise.all(
          [
            ...lendEventsAddresses,
            ...buyoutEventsAddresses,
            ...repaymentEventAddresses,
            ...collateralSeizureAddresses,
          ].map((a) => getNotificationRequestsForAddress(a)),
        )
      )
        .flat()
        .filter(
          (request) => request.deliveryMethod === NotificationMethod.EMAIL,
        ).length;

      const actualNumEmails = await getBackedMetric(Metric.EMAILS_PAST_DAY);

      const confirmationEmailComponents: GenericEmailComponents = {
        mainMessage: `
Expected: ${expectedNumEmails}
Actual: ${actualNumEmails}
      `,
        footer: '',
      };

      await executeEmailSendWithSes(
        generateHTMLForGenericEmail(confirmationEmailComponents),
        `[${config.network}]: Email Monitoring Report for ${dayjs
          .unix(currentTimestamp)
          .format('MM/DD/YYYY')}`,
        process.env.EMAIL_MONITOR_REPORT_TO!,
      );
    }

    await resetBackedMetric(Metric.EMAILS_PAST_DAY);

    res.status(200).json('email sends monitored successfully');
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
