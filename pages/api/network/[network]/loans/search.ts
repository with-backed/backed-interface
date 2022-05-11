import { NextApiRequest, NextApiResponse } from 'next';
import { searchLoans } from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan,
  LoanStatus,
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
    const {
      page,
      limit,
      sort,
      sortDirection,
      statuses,
      collectionAddress,
      collectionName,
      loanAsset,
      borrowerAddress,
      lenderAddress,
      loanAmountMin,
      loanAmountMinDecimals,
      loanAmountMax,
      loanAmountMaxDecimals,
      loanInterestMin,
      loanInterestMax,
      loanDurationMin,
      loanDurationMax,
      network,
    } = req.query;
    const config = configs[network as SupportedNetwork];

    const loans = await searchLoans(
      (statuses as string).split(',') as LoanStatus[],
      collectionAddress as string,
      collectionName as string,
      loanAsset as string,
      borrowerAddress as string,
      lenderAddress as string,
      {
        loanAssetDecimal: parseInt(loanAmountMinDecimals as string),
        nominal: parseInt(loanAmountMin as string),
      },
      {
        loanAssetDecimal: parseInt(loanAmountMaxDecimals as string),
        nominal: parseInt(loanAmountMax as string),
      },
      parseInt(loanInterestMin as string),
      parseInt(loanInterestMax as string),
      parseInt(loanDurationMin as string),
      parseInt(loanDurationMax as string),
      sort as Loan_OrderBy,
      sortDirection as OrderDirection,
      parseInt(limit as string),
      config.nftBackedLoansSubgraph,
      parseInt(page as string),
    );

    res.status(200).json(loans);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
