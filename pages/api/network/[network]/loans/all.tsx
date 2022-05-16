import { NextApiRequest, NextApiResponse } from 'next';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan,
  Loan_OrderBy,
  OrderDirection,
} from 'types/generated/graphql/nftLoans';
import { captureException, withSentry } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Loan[] | null>,
) {
  try {
    validateNetwork(req.query);
    const { page, limit, sort, sortDirection, network } = req.query;
    const config = configs[network as SupportedNetwork];

    const loans = await subgraphLoans(
      parseInt(limit as string),
      config.nftBackedLoansSubgraph,
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
