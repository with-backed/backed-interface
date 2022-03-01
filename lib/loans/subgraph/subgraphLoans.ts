import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import { nftBackedLoansClient } from '../../urql';
import {
  QueryLoansArgs,
  Loan,
  Loan_Filter,
  Loan_OrderBy,
  OrderDirection,
  LoanStatus,
} from 'types/generated/graphql/nftLoans';
import { ethers } from 'ethers';
import { annualRateToPerSecond } from 'lib/interest';
import { daysToSecondsBigNum } from 'lib/duration';
import { gql } from 'urql';

const homepageQuery = gql`
    query($where: Loan_filter , $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
        loans(where: $where, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
            ${ALL_LOAN_PROPERTIES}
        }
    }
`;

// TODO(Wilson): this is a temp fix just for this query. We should generalize this method to
// take an arguments and return a cursor to return paginated results
export default async function subgraphLoans(
  first: number,
  page: number = 1,
  sort: Loan_OrderBy = Loan_OrderBy.CreatedAtTimestamp,
  sortDirection: OrderDirection = OrderDirection.Desc,
): Promise<Loan[]> {
  const whereFilter: Loan_Filter = { closed: false };
  const queryArgs: QueryLoansArgs = {
    where: whereFilter,
    first,
    skip: (page - 1) * first,
    orderBy: sort,
    orderDirection: sortDirection,
  };

  const {
    data: { loans },
  } = await nftBackedLoansClient.query(homepageQuery, queryArgs).toPromise();

  return loans;
}

const searchQuery = (
  lendTicketHolder: string,
  loanAmountMax: number,
  perSecondInterestRateMax: number,
  durationSecondsMax: number,
) => gql`
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
    $sortDirection: String,
    $first: Int, 
    $skip: Int,
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
            ? 'lendTicketHolder_contains: $lendTicketHolder,'
            : ''
        }
        loanAmount_gt: $loanAmountMin,
        ${loanAmountMax != 0 ? 'loanAmount_lt: $loanAmountMax' : ''}
        
        perSecondInterestRate_gt: $perSecondInterestRateMin,
        ${
          perSecondInterestRateMax != 0
            ? 'perSecondInterestRate_lt: $perSecondInterestRateMax'
            : ''
        }
        durationSeconds_gt: $durationSecondsMin,
        ${
          durationSecondsMax != 0
            ? 'durationSeconds_lt: $durationSecondsMax'
            : ''
        }
      },
      orderBy: $selectedSort,
      orderDirection: $sortDirection,
      first: $first, 
      skip: $skip,
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
  sortDirection: OrderDirection,
  first: number,
  page: number = 1,
): Promise<Loan[]> {
  const { data } = await nftBackedLoansClient
    .query<{ loans: Loan[] }>(
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
        sortDirection,
        first,
        skip: (page - 1) * first,
      },
    )
    .toPromise();

  if (data?.loans) {
    return data.loans;
  }

  return [];
}

const formatNumberForGraph = (loanAmount: LoanAmountInputType): string => {
  return ethers.utils
    .parseUnits(loanAmount.nominal.toString(), loanAmount.loanAssetDecimal)
    .toString();
};

const liquidatingLoansQuery = gql`
    query($where: Loan_filter) {
        loans(where: $where) {
            ${ALL_LOAN_PROPERTIES}
        }
    }
`;

export async function getLoansExpiringWithin(
  timeOne: number,
  timeTwo: number,
): Promise<Loan[]> {
  const where: Loan_Filter = {
    endDateTimestamp_gt: timeOne,
    endDateTimestamp_lt: timeTwo,
  };

  const graphResponse = await nftBackedLoansClient
    .query(liquidatingLoansQuery, {
      where,
    })
    .toPromise();
  return graphResponse.data['loans'] as Loan[];
}
