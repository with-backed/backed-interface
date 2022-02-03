import { NextApiRequest, NextApiResponse } from 'next';
import subgraphLoans, { searchLoans } from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan,
  LoanStatus,
  Loan_OrderBy,
} from 'types/generated/graphql/nftLoans';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Loan[] | null>,
) {
  try {
    const {
      page,
      limit,
      sort,
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
    } = req.query;

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
