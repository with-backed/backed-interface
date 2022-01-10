import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRpcLoanFacilitator } from 'lib/contracts';
import { ethers } from 'ethers';

export interface BetterEvent extends Omit<ethers.Event, 'args'> {
  args: { [key: string]: any };
}

export async function getTicketHistory(
  loanId: ethers.BigNumber,
): Promise<BetterEvent[]> {
  const contract = jsonRpcLoanFacilitator();

  const mintTicketFilter = contract.filters.CreateLoan(loanId, null);
  const closeFilter = contract.filters.Close(loanId);
  const underwriteFilter = contract.filters.UnderwriteLoan(loanId);
  const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(loanId);
  const repayAndCloseFilter = contract.filters.Repay(loanId);
  const seizeCollateralFilter = contract.filters.SeizeCollateral(loanId);

  const filters = [
    mintTicketFilter,
    closeFilter,
    underwriteFilter,
    buyoutUnderwriteFilter,
    repayAndCloseFilter,
    seizeCollateralFilter,
  ];

  const [...events] = await Promise.all(
    filters.map((filter) => {
      return contract.queryFilter(
        filter,
        parseInt(process.env.NEXT_PUBLIC_FACILITATOR_START_BLOCK || ''),
      );
    }),
  );

  // TODO: keep track of TypedEvents so we don't have to do a type coercion
  // in ParsedEvent
  const allEvents = events
    .flat()
    .map((e) => ({
      ...e,
      args: Object.fromEntries(
        Object.entries(e.args).filter(([key, _]) => isNaN(parseInt(key))),
      ),
    }))
    .sort((a, b) => b.blockNumber - a.blockNumber);
  console.log(Object.keys(allEvents[0].args));
  return allEvents;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BetterEvent[] | null>,
) {
  try {
    const { id } = req.query;
    const idString: string = Array.isArray(id) ? id[0] : id;
    const history = await getTicketHistory(ethers.BigNumber.from(idString));
    history;
    res.status(200).json(history);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
