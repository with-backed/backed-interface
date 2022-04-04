import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { getUnitPriceForCoin } from 'lib/coingecko';
import { updateWatcher } from 'lib/events/consumers/discord/bot';
import { DiscordMetric } from 'lib/events/consumers/discord/shared';
import {
  getCreatedLoansSince,
  getLentToLoansSince,
} from 'lib/loans/subgraph/subgraphLoans';
import { NextApiRequest, NextApiResponse } from 'next';

const oneWeekAgoTimestamp = () =>
  Math.floor(new Date().getTime() / 1000 - 7 * 24 * 3600);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const createdLoansThisWeek = await getCreatedLoansSince(
      oneWeekAgoTimestamp(),
    );
    const lentToLoansThisWeek = await getLentToLoansSince(
      oneWeekAgoTimestamp(),
    );

    const lentToLoansDollarValues = await Promise.all(
      lentToLoansThisWeek.map(
        async (loan) =>
          parseFloat(
            ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimal),
          ) *
          ((await getUnitPriceForCoin(loan.loanAssetContractAddress, 'usd')) ||
            0),
      ),
    );

    await updateWatcher(
      DiscordMetric.NUM_LOANS_CREATED,
      createdLoansThisWeek.length,
    );
    await updateWatcher(
      DiscordMetric.NUM_LOANS_LENT_TO,
      lentToLoansThisWeek.length,
    );
    await updateWatcher(
      DiscordMetric.DOLLAR_LOANS_LENT_TO,
      lentToLoansDollarValues.reduce((a, b) => a + b, 0),
    );

    res.status(200).json({ success: true });
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
