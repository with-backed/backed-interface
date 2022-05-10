import { nftBackedLoansClient, nftBackedLoansClientFromConfig } from 'lib/urql';
import {
  QueryLoansArgs,
  Loan,
  Loan_Filter,
  Loan_OrderBy,
  OrderDirection,
  LoanStatus,
  AllLoansQuery,
  AllLoansDocument,
  HomepageSearchQuery,
  HomepageSearchDocument,
  HomepageSearchWithoutLenderQuery,
  HomepageSearchWithoutLenderDocument,
  LendEvent,
  EventsForLoanQuery,
  EventsForLoanDocument,
} from 'types/generated/graphql/nftLoans';
import { ethers } from 'ethers';
import { daysToSecondsBigNum } from 'lib/duration';
import { CombinedError } from 'urql';
import { INTEREST_RATE_PERCENT_DECIMALS } from 'lib/constants';
import { captureException } from '@sentry/nextjs';
import { Config } from 'lib/config';

// TODO(Wilson): this is a temp fix just for this query. We should generalize this method to
// take an arguments and return a cursor to return paginated results
export default async function subgraphLoans(
  first: number,
  page: number = 1,
  sort: Loan_OrderBy = Loan_OrderBy.CreatedAtTimestamp,
  sortDirection: OrderDirection = OrderDirection.Desc,
): Promise<Loan[]> {
  const whereFilter: Loan_Filter = {
    closed: false,
    id_not_in: !!process.env.LOAN_ID_BLOCK_LIST
      ? process.env.LOAN_ID_BLOCK_LIST.split(',')
      : undefined,
  };
  const queryArgs: QueryLoansArgs = {
    where: whereFilter,
    first,
    skip: (page - 1) * first,
    orderBy: sort,
    orderDirection: sortDirection,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllLoansQuery>(AllLoansDocument, queryArgs)
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.loans || [];
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
  const where = {
    statuses,
    collateralContractAddress,
    collateralName,
    loanAssetSymbol,
    borrowTicketHolder,
    lendTicketHolder: lendTicketHolder === '' ? undefined : lendTicketHolder,
    loanAmountMin: formatNumberForGraph(loanAmountMin),
    loanAmountMax:
      loanAmountMax.nominal === 0
        ? ethers.constants.MaxInt256.toString()
        : formatNumberForGraph(loanAmountMax),
    perAnumInterestRateMin: formatInterestForGraph(loanInterestMin),
    perAnumInterestRateMax:
      loanInterestMax === 0
        ? // 2^16 - 1 is max possible
          ethers.BigNumber.from(2).pow(16).sub(1).toString()
        : formatInterestForGraph(loanInterestMax),
    durationSecondsMin: daysToSecondsBigNum(loanDurationMin).toString(),
    durationSecondsMax:
      loanDurationMax === 0
        ? ethers.constants.MaxInt256.toString()
        : daysToSecondsBigNum(loanDurationMax).toString(),
    selectedSort,
    sortDirection,
    first,
    skip: (page - 1) * first,
  };

  let data: HomepageSearchQuery | HomepageSearchWithoutLenderQuery | undefined;
  let error: CombinedError | undefined;

  if (lendTicketHolder === '') {
    ({ data, error } = await nftBackedLoansClient
      .query<HomepageSearchWithoutLenderQuery>(
        HomepageSearchWithoutLenderDocument,
        where,
      )
      .toPromise());
  } else {
    ({ data, error } = await nftBackedLoansClient
      .query<HomepageSearchQuery>(HomepageSearchDocument, where)
      .toPromise());
  }

  if (error) {
    captureException(error);
  }
  return data?.loans || [];
}

const formatNumberForGraph = (loanAmount: LoanAmountInputType): string => {
  return ethers.utils
    .parseUnits(loanAmount.nominal.toString(), loanAmount.loanAssetDecimal)
    .toString();
};

const formatInterestForGraph = (interest: number): string => {
  return ethers.utils
    .parseUnits(interest.toString(), INTEREST_RATE_PERCENT_DECIMALS - 2)
    .toString();
};

export async function getLoansExpiringWithin(
  timeOne: number,
  timeTwo: number,
  config: Config,
): Promise<Loan[]> {
  const nftBackedLoansClient = nftBackedLoansClientFromConfig(config);

  const where: Loan_Filter = {
    endDateTimestamp_gt: timeOne,
    endDateTimestamp_lt: timeTwo,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllLoansQuery>(AllLoansDocument, {
      where,
    })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.loans || [];
}

export async function getMostRecentTermsForLoan(
  loanId: string,
): Promise<LendEvent | undefined> {
  const { data, error } = await nftBackedLoansClient
    .query<EventsForLoanQuery>(EventsForLoanDocument, { id: loanId })
    .toPromise();

  if (error) {
    captureException(error);
  }

  const lendEvents = (data?.loan?.lendEvents as LendEvent[]) || [];
  if (lendEvents.length === 0) return undefined;

  return lendEvents.sort((a, b) => b.blockNumber - a.blockNumber)[1];
}

export async function getCreatedLoansSince(timestamp: number) {
  const where: Loan_Filter = {
    createdAtTimestamp_gt: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllLoansQuery>(AllLoansDocument, {
      where,
    })
    .toPromise();

  if (error) {
    captureException(error);
  }
  return data?.loans || [];
}

export async function getLentToLoansSince(timestamp: number) {
  const where: Loan_Filter = {
    lastAccumulatedTimestamp_gt: timestamp,
  };

  const { data, error } = await nftBackedLoansClient
    .query<AllLoansQuery>(AllLoansDocument, {
      where,
    })
    .toPromise();
  if (error) {
    captureException(error);
  }
  return data?.loans || [];
}
