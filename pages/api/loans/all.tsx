import { NextApiRequest, NextApiResponse } from 'next';
import { nodeLoanEventsById } from 'lib/loans/node/nodeLoanEventsById';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import { Loan } from 'types/generated/graphql/nftLoans';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Loan[] | null>,
) {
  try {
    const { page, limit } = req.query;

    const loans = await subgraphLoans(
      parseInt(limit as string),
      parseInt(page as string),
    );

    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
