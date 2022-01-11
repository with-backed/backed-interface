import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import { nftBackedLoansClient } from '../../urql';
import {
  Loan,
  LoanStatus,
  Loan_OrderBy,
} from 'types/generated/graphql/nftLoans';
import { ethers } from 'ethers';
import { annualRateToPerSecond } from 'lib/interest';
import { daysToSecondsBigNum } from 'lib/duration';

const homepageQuery = `
    query {
        loans(where: { closed: false}, first: 20, orderBy: createdAtTimestamp, orderDirection: desc) {
            ${ALL_LOAN_PROPERTIES}
        }
    }
`;

// TODO(Wilson): this is a temp fix just for this query. We should generalize this method to
// take an arguments and return a cursor to return paginated results
export default async function subgraphLoans(): Promise<Loan[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(homepageQuery).toPromise();

  return loans;
}

const searchQuery = (
  lendTicketHolder: string,
  loanAmountMax: number,
  perSecondInterestRateMax: number,
  durationSecondsMax: number,
) => `
  query(
    $statuses: [String], 
    $collateralContractAddress: String,
    $collateralName: String,
    $loanAssetSymbol: String,
    $borrowTicketHolder: String,
    $lendTicketHolder: String,
    $loanAmountMin: BigInt,
    $loanAmountMax: BigInt,
    $perSecondInterestRateMin: BigInt,
    $perSecondInterestRateMax: BigInt,
    $durationSecondsMin: BigInt,
    $durationSecondsMax: BigInt,
    $selectedSort: String,
  ) {
    loans(where: 
      {
        status_in: $statuses,
        collateralContractAddress_contains: $collateralContractAddress,
        collateralName_contains: $collateralName,
        loanAssetSymbol_contains: $loanAssetSymbol,
        borrowTicketHolder_contains: $borrowTicketHolder,
        ${
          lendTicketHolder != ''
            ? 'lendTicketHolder_contains: $lendTicketHolder'
            : ''
        }
        ${loanAmountMax != 0 ? 'loanAmount_lt: $loanAmountMax' : ''}
        ${
          perSecondInterestRateMax != 0
            ? 'perSecondInterestRate_lt: $perSecondInterestRateMax'
            : ''
        }
        ${
          durationSecondsMax != 0
            ? 'durationSeconds_lt: $durationSecondsMax'
            : ''
        }
      },
      orderBy: $selectedSort,
      orderDirection: desc,
    ) {
      ${ALL_LOAN_PROPERTIES}
    }
  }
`;

export type LoanAmountInputType = {
  loanAssetDecimal: number;
  nominal: number;
};

export async function searchLoans(
  statuses: LoanStatus[],
  collateralContractAddress: string,
  collateralName: string,
  loanAssetSymbol: string,
  borrowTicketHolder: string,
  lendTicketHolder: string,
  loanAmountMin: LoanAmountInputType,
  loanAmountMax: LoanAmountInputType,
  loanInterestMin: number,
  loanInterestMax: number,
  loanDurationMin: number,
  loanDurationMax: number,
  selectedSort: Loan_OrderBy,
): Promise<Loan[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient
    .query(
      searchQuery(
        lendTicketHolder,
        loanAmountMax.nominal,
        loanInterestMax,
        loanDurationMax,
      ),
      {
        statuses,
        collateralContractAddress,
        collateralName,
        loanAssetSymbol,
        borrowTicketHolder,
        lendTicketHolder,
        loanAmountMin: formatNumberForGraph(loanAmountMin),
        loanAmountMax: formatNumberForGraph(loanAmountMax),
        perSecondInterestRateMin: annualRateToPerSecond(loanInterestMin),
        perSecondInterestRateMax: annualRateToPerSecond(loanInterestMax),
        durationSecondsMin: daysToSecondsBigNum(loanDurationMin).toString(),
        durationSecondsMax: daysToSecondsBigNum(loanDurationMax).toString(),
        selectedSort,
      },
    )
    .toPromise();

  return loans;
}

const formatNumberForGraph = (loanAmount: LoanAmountInputType): string => {
  return ethers.utils
    .parseUnits(loanAmount.nominal.toString(), loanAmount.loanAssetDecimal)
    .toString();
};
