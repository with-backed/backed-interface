import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from '../repository';

export async function main(currentTimestamp: number) {
  console.log(
    `running notifications cron job with timestamp ${currentTimestamp} and killswitch is ${
      process.env.NOTIFICATIONS_KILLSWITCH ? 'on' : 'off'
    }`,
  );
  if (process.env.NOTIFICATIONS_KILLSWITCH) return;

  let pastTimestamp = await getLastWrittenTimestamp();
  if (!pastTimestamp) {
    // if we couldn't get pastTimestamp from postgres for whatever reason, just default to N hours before
    pastTimestamp =
      currentTimestamp -
      parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;
  }

  const futureTimestamp =
    currentTimestamp +
    parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;

  let loans = await getLoansExpiringWithin(currentTimestamp, futureTimestamp);
  for (let i = 0; i < loans.length; i++) {
    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurringBorrower`,
      {
        method: 'POST',
        body: JSON.stringify({
          loan: loans[i],
        }),
      },
    );

    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurringLender`,
      {
        method: 'POST',
        body: JSON.stringify({
          loan: loans[i],
        }),
      },
    );
  }

  loans = await getLoansExpiringWithin(pastTimestamp, currentTimestamp);
  for (let i = 0; i < loans.length; i++) {
    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurredBorrower`,
      {
        method: 'POST',
        body: JSON.stringify({
          loan: loans[i],
        }),
      },
    );

    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurredLender`,
      {
        method: 'POST',
        body: JSON.stringify({
          loan: loans[i],
        }),
      },
    );
  }

  await overrideLastWrittenTimestamp(currentTimestamp);
}
