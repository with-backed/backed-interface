import { getAllActiveLoansForAddress } from 'lib/loans/subgraph/getAllSubgraphLoansForAddress';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoan[]>,
) {
  try {
    const { address } = req.query;
    const loans = await getAllActiveLoansForAddress(address as string);
    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
