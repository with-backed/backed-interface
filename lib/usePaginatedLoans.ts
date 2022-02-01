import { useCallback, useEffect, useState } from 'react';
import {
  Loan as SubgraphLoan,
  Loan_OrderBy,
} from 'types/generated/graphql/nftLoans';
import useSWRInfinite from 'swr/infinite';
import { useOnScreen } from './useOnScreenRef';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePaginatedLoans(
  url: string,
  ref: any,
  pageSize: number,
  selectedSort: Loan_OrderBy | undefined,
  initialLoans: SubgraphLoan[] = [],
  skipQuery: boolean = false,
) {
  const isVisible = useOnScreen(ref);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      skipQuery
        ? null
        : `${url}?limit=${pageSize}&page=${index + 1}&sort=${
            selectedSort || Loan_OrderBy.CreatedAtTimestamp
          }`,
    fetcher,
  );

  const paginatedLoans = data ? [].concat(...data) : initialLoans;

  useEffect(() => {
    if (!selectedSort) return;
    setSize(1);
  }, [selectedSort, setSize]);

  const isEmpty = data?.[0]?.length === 0;
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < pageSize);

  useEffect(() => {
    if (isVisible && !isLoadingMore && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [isVisible, isLoadingMore, isReachingEnd, isValidating, size, setSize]);

  return { paginatedLoans, error };
}
