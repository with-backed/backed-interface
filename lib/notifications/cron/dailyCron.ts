import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from '../repository';

export async function main(currentTimestamp: number) {
  console.log(
    `running notifications cron job with timestamp ${currentTimestamp}`,
  );
  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_KILLSWITCH) return;

  const pastTimestamp = await getLastWrittenTimestamp();
  if (!pastTimestamp) {
    console.log('unable to get last written timestamp');
    return;
  }
  console.log(`pastTimestamp is ${pastTimestamp}`);

  const futureTimestamp =
    currentTimestamp +
    parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;

  console.log(`future timestamp is ${futureTimestamp}`);

  let loans = await getLoansExpiringWithin(currentTimestamp, futureTimestamp);
  for (let i = 0; i < loans.length; i++) {
    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurring`,
      {
        method: 'POST',
        body: JSON.stringify({
          borrowTicketHolder: loans[i].borrowTicketHolder,
          lendTicketHolder: loans[i].lendTicketHolder,
        }),
      },
    );
  }

  loans = await getLoansExpiringWithin(pastTimestamp, currentTimestamp);
  for (let i = 0; i < loans.length; i++) {
    await fetch(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccurred`,
      {
        method: 'POST',
        body: JSON.stringify({
          borrowTicketHolder: loans[i].borrowTicketHolder,
          lendTicketHolder: loans[i].lendTicketHolder,
        }),
      },
    );
  }

  await overrideLastWrittenTimestamp(currentTimestamp);
}
