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
import {
  HomepageQueryDocument,
  HomepageQueryQuery,
  HomepageSearchDocument,
  HomepageSearchQuery,
  LoansWhereDocument,
  LoansWhereQuery,
} from 'types/generated/graphql/nft-backed-loans-operations';

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

  const { data } = await nftBackedLoansClient
    .query<HomepageQueryQuery>(HomepageQueryDocument, queryArgs)
    .toPromise();

  if (!data?.loans) {
    return [];
  }

  return data.loans;
}

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
    .query<HomepageSearchQuery>(HomepageSearchDocument, {
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
    })
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

export async function getLoansExpiringWithin(
  timeOne: number,
  timeTwo: number,
): Promise<Loan[]> {
  const where: Loan_Filter = {
    endDateTimestamp_gt: timeOne,
    endDateTimestamp_lt: timeTwo,
  };

  const { data } = await nftBackedLoansClient
    .query<LoansWhereQuery>(LoansWhereDocument, {
      where,
    })
    .toPromise();
  if (!data?.loans) {
    return [];
  }
  return data.loans;
}
