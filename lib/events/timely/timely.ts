import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { Loan } from 'types/generated/graphql/nftLoans';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from '../consumers/userNotifications/repository';

const HOURS_IN_DAY = 24;

type LiquidatedLoans = {
  liquidationOccurringLoans: Loan[];
  liquidationOccurredLoans: Loan[];
};

export async function getLiquidatedLoansForTimestamp(
  currentTimestamp: number,
  nftBackedLoansSubgraph?: string,
): Promise<LiquidatedLoans> {
  // TODO: fix
  if (!nftBackedLoansSubgraph) {
    return {
      liquidationOccurredLoans: [],
      liquidationOccurringLoans: [],
    };
  }
  const notificationsFreq = parseInt(
    process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!,
  );

  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_KILLSWITCH || !notificationsFreq)
    return {
      liquidationOccurredLoans: [],
      liquidationOccurringLoans: [],
    };

  let pastTimestamp = await getLastWrittenTimestamp();
  if (!pastTimestamp) {
    // if we couldn't get pastTimestamp from postgres for whatever reason, just default to N hours before
    pastTimestamp = currentTimestamp - notificationsFreq * 3600;
  }

  // ensure no timestamps get missed by using the last run timestamp + 1 hour (or whatever of freq is)
  // in a perfect world, currentTimestamp === currentRunTimestamp, but with inconsistincies in our cron or anything else, they may differ
  const currentRunTimestamp = pastTimestamp + notificationsFreq * 3600;

  const [liquidationOccurringLoans, liquidationOccurredLoans] =
    await Promise.all([
      getLoansExpiringWithin(
        currentRunTimestamp + HOURS_IN_DAY * 3600,
        currentRunTimestamp + (HOURS_IN_DAY + notificationsFreq) * 3600,
        nftBackedLoansSubgraph,
      ),
      getLoansExpiringWithin(
        currentRunTimestamp - notificationsFreq * 3600,
        currentRunTimestamp,
        nftBackedLoansSubgraph,
      ),
    ]);

  await overrideLastWrittenTimestamp(currentTimestamp);

  return {
    liquidationOccurringLoans,
    liquidationOccurredLoans,
  };
}
