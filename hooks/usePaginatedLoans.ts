import { useCallback, useEffect, useState } from 'react';
import {
  Loan as SubgraphLoan,
  Loan_OrderBy,
} from 'types/generated/graphql/nftLoans';
import useSWRInfinite from 'swr/infinite';
import { SortOptionValue } from 'components/AdvancedSearch/SortDropdown';
import { parseSubgraphLoan } from 'lib/loans/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePaginatedLoans(
  url: string,
  pageSize: number,
  selectedSort: SortOptionValue | undefined,
  initialLoans: SubgraphLoan[] = [],
) {
  const [paginatedLoans, setPaginatedLoans] = useState(
    initialLoans.map(parseSubgraphLoan),
  );
  const { data, error, size, setSize } = useSWRInfinite(
    (index) =>
      `${url}limit=${pageSize}&page=${index + 1}&sort=${
        selectedSort?.field || Loan_OrderBy.CreatedAtTimestamp
      }&sortDirection=${selectedSort?.direction || 'desc'}`,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      setPaginatedLoans([].concat(...data).map(parseSubgraphLoan));
    }
  }, [data]);

  useEffect(() => {
    if (!selectedSort) return;
    setSize(1);
  }, [selectedSort, url, setSize]);

  const isEmpty = data?.[0]?.length === 0;
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < pageSize);

  const loadMore = useCallback(() => {
    setSize((prev) => prev + 1);
  }, [setSize]);

  return { paginatedLoans, error, isLoadingMore, isReachingEnd, loadMore };
}
