import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';

// TODO: Should probably not just relying on
// the subgraph, but fall back to the node, if the call didn't work
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoan | null>,
) {
  try {
    const { id, includeEvents } = req.query;
    const idString: string = Array.isArray(id) ? id[0] : id;
    const includeEventsBool: boolean = Array.isArray(includeEvents)
      ? includeEvents[0] == 'true'
      : includeEvents == 'true';

    const loan = await subgraphLoanById(idString, includeEventsBool);
    res.status(200).json(loan);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
