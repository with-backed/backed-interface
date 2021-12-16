import { getAllSubgraphLoansForAddress } from 'lib/loans/getAllSubgraphLoansForAddress';
import { SubgraphLoanEntity } from 'lib/loans/sharedLoanSubgraphConstants';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoanEntity[]>,
) {
  try {
    const { address } = req.query;
    const loans = await getAllSubgraphLoansForAddress(address);
    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
