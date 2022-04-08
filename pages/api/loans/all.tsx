import { NextApiRequest, NextApiResponse } from 'next';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan,
  Loan_OrderBy,
  OrderDirection,
} from 'types/generated/graphql/nftLoans';
import { captureException, withSentry } from '@sentry/nextjs';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Loan[] | null>,
) {
  try {
    const { page, limit, sort, sortDirection } = req.query;

    const loans = await subgraphLoans(
      parseInt(limit as string),
      parseInt(page as string),
      sort as Loan_OrderBy,
      sortDirection as OrderDirection,
    );

    res.status(200).json(loans);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
