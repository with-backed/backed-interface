import { getAllActiveLoansForAddress } from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubgraphLoan[]>,
) {
  try {
    validateNetwork(req.query);
    const { address, network } = req.query;
    const config = configs[network as SupportedNetwork];
    const loans = await getAllActiveLoansForAddress(
      address as string,
      config.nftBackedLoansSubgraph,
    );
    res.status(200).json(loans);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
