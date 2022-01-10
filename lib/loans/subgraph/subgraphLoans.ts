import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import { nftBackedLoansClient } from '../../urql';
import { Loan, LoanStatus } from 'types/generated/graphql/nftLoans';
import { BigNumber, ethers } from 'ethers';
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

export enum SearchQuerySort {
  CreatedAtTimestamp = 'createdAtTimestamp',
  PerSecondInterestRate = 'perSecondInterestRate',
  LoanAmount = 'loanAmount',
}

const searchQuery = (
  loanAmountMin: number,
  loanAmountMax: number,
  perSecondInterestRateMin: number,
  perSecondInterestRateMax: number,
  durationSecondsMin: number,
  durationSecondsMax: number,
) => `
  query(
    $statuses: [String], 
    $collateralContractAddress: String,
    $collateralName: String,
    $loanAssetSymbol: String,
    $borrowTicketHolder: String,
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
        collateralContractAddress_starts_with: $collateralContractAddress,
        collateralName_starts_with: $collateralName,
        loanAssetSymbol_starts_with: $loanAssetSymbol,
        borrowTicketHolder_starts_with: $borrowTicketHolder,
        ${loanAmountMin != 0 ? 'loanAmount_gt: $loanAmountMin' : ''}
        ${loanAmountMax != 0 ? 'loanAmount_lt: $loanAmountMax' : ''}
        ${
          perSecondInterestRateMin != 0
            ? 'perSecondInterestRate_gt: $perSecondInterestRateMin'
            : ''
        }
        ${
          perSecondInterestRateMax != 0
            ? 'perSecondInterestRate_lt: $perSecondInterestRateMax'
            : ''
        }
        ${
          durationSecondsMin != 0
            ? 'durationSeconds_gt: $durationSecondsMin'
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

export async function searchLoans(
  statuses: LoanStatus[],
  collateralContractAddress: string,
  collateralName: string,
  loanAssetSymbol: string,
  borrowTicketHolder: string,
  loanAmountMin: number,
  loanAmountMax: number,
  loanInterestMin: number,
  loanInterestMax: number,
  loanDurationMin: number,
  loanDurationMax: number,
  selectedSort: SearchQuerySort,
): Promise<Loan[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient
    .query(
      searchQuery(
        loanAmountMin,
        loanAmountMax,
        loanInterestMin,
        loanInterestMax,
        loanDurationMin,
        loanDurationMax,
      ),
      {
        statuses,
        collateralContractAddress,
        collateralName,
        loanAssetSymbol,
        borrowTicketHolder,
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

const formatNumberForGraph = (num: number): string => {
  return ethers.utils.parseUnits(num.toString()).toString();
};
