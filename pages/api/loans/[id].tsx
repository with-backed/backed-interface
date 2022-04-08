import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
import { LoanByIdQuery } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';

// TODO: Should probably not just relying on
// the subgraph, but fall back to the node, if the call didn't work
// TODO: is this route used?
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoanByIdQuery['loan'] | null>,
) {
  try {
    const { id } = req.query;
    const idString: string = Array.isArray(id) ? id[0] : id;

    const loan = await subgraphLoanById(idString);
    res.status(200).json(loan);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
