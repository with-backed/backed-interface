import { getAllSubgraphLoansForAddress } from 'lib/loans/subgraph/getAllSubgraphLoansForAddress';
import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoan[]>,
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
