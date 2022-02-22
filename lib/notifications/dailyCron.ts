import path from 'path';
import fs from 'fs';

import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';

export async function main(currentTimestamp: number) {
  if (process.env.killswitch) return;

  const timestampFilePath = path.resolve(
    __dirname,
    `./cron/${process.env.TIMESTAMP_FILENAME}.txt`,
  );

  const pastTimestamp = parseInt(fs.readFileSync(timestampFilePath).toString());
  const futureTimestamp =
    currentTimestamp + parseInt(process.env.FREQUENCY!) * 3600;

  let loans = await getLoansExpiringWithin(currentTimestamp, futureTimestamp);
  for (let i = 0; i < loans.length; i++) {
    await fetch(
      `${process.env.PAWN_SHOP_URL!}/api/events/cron/LiquidationOccuring`,
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
      `${process.env.PAWN_SHOP_URL!}/api/events/cron/LiquidationOccured`,
      {
        method: 'POST',
        body: JSON.stringify({
          borrowTicketHolder: loans[i].borrowTicketHolder,
          lendTicketHolder: loans[i].lendTicketHolder,
        }),
      },
    );
  }

  if (!process.env.JEST_WORKER_ID) {
    await fs.writeFileSync(timestampFilePath, currentTimestamp.toString());
  }
}
