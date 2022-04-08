import { getAllActiveLoansForAddress } from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoan[]>,
) {
  try {
    const { address } = req.query;
    const loans = await getAllActiveLoansForAddress(address as string);
    res.status(200).json(loans);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
