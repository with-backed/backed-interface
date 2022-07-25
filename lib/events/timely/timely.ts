import { SECONDS_IN_AN_HOUR } from 'lib/constants';
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
  currentRunTimestamp: number;
};

export async function getLiquidatedLoansForTimestamp(
  currentTimestamp: number,
  nftBackedLoansSubgraph: string,
): Promise<LiquidatedLoans> {
  const notificationsFreq = parseInt(
    process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!,
  );

  let pastTimestamp = await getLastWrittenTimestamp();

  if (!pastTimestamp) {
    // if we couldn't get pastTimestamp from postgres for whatever reason, just default to N hours before
    pastTimestamp = currentTimestamp - notificationsFreq * SECONDS_IN_AN_HOUR;
  }

  // ensure no timestamps get missed by using the last run timestamp + 1 hour (or whatever of freq is)
  // in a perfect world, currentTimestamp === currentRunTimestamp, but with inconsistincies in our cron or anything else, they may differ
  const currentRunTimestamp =
    pastTimestamp + notificationsFreq * SECONDS_IN_AN_HOUR;

  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_KILLSWITCH || !notificationsFreq)
    return {
      liquidationOccurredLoans: [],
      liquidationOccurringLoans: [],
      currentRunTimestamp: currentRunTimestamp,
    };

  const [liquidationOccurringLoans, liquidationOccurredLoans] =
    await Promise.all([
      getLoansExpiringWithin(
        currentRunTimestamp + HOURS_IN_DAY * SECONDS_IN_AN_HOUR,
        currentRunTimestamp +
          (HOURS_IN_DAY + notificationsFreq) * SECONDS_IN_AN_HOUR,
        nftBackedLoansSubgraph,
      ),
      getLoansExpiringWithin(
        currentRunTimestamp - notificationsFreq * SECONDS_IN_AN_HOUR,
        currentRunTimestamp,
        nftBackedLoansSubgraph,
      ),
    ]);

  return {
    liquidationOccurringLoans,
    liquidationOccurredLoans,
    currentRunTimestamp,
  };
}
