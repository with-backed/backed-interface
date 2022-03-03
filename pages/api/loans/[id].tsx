import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
import { LoanByIdQuery } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';

// TODO: Should probably not just relying on
// the subgraph, but fall back to the node, if the call didn't work
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoanByIdQuery['loan'] | null>,
) {
  try {
    const { id } = req.query;
    const idString: string = Array.isArray(id) ? id[0] : id;

    const loan = await subgraphLoanById(idString);
    res.status(200).json(loan);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
