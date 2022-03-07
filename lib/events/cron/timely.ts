import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { Loan } from 'types/generated/graphql/nftLoans';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from '../../notifications/repository';

type LiquidatedLoans = {
  liquidationOccurringLoans: Loan[];
  liquidationOccurredLoans: Loan[];
};

export async function getLiquidatedLoansForTimestamp(
  currentTimestamp: number,
): Promise<LiquidatedLoans> {
  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_KILLSWITCH)
    return {
      liquidationOccurredLoans: [],
      liquidationOccurringLoans: [],
    };

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

  const liquidationOccurringLoans = await getLoansExpiringWithin(
    currentTimestamp,
    futureTimestamp,
  );

  const liquidationOccurredLoans = await getLoansExpiringWithin(
    pastTimestamp,
    currentTimestamp,
  );

  await overrideLastWrittenTimestamp(currentTimestamp);

  return {
    liquidationOccurringLoans,
    liquidationOccurredLoans,
  };
}
