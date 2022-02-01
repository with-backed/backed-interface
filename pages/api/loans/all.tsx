import { NextApiRequest, NextApiResponse } from 'next';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import { Loan, Loan_OrderBy } from 'types/generated/graphql/nftLoans';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Loan[] | null>,
) {
  try {
    const { page, limit, sort } = req.query;

    const loans = await subgraphLoans(
      parseInt(limit as string),
      parseInt(page as string),
      sort as Loan_OrderBy,
    );

    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
