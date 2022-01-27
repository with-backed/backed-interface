import { FiveColumn } from 'components/layouts/FiveColumn';
import { LoanCard } from 'components/LoanCard';
import subgraphLoans, { searchLoans } from 'lib/loans/subgraph/subgraphLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { AdvancedSearch } from 'components/AdvancedSearch/AdvancedSearch';
import useSWRInfinite from 'swr/infinite';
import { useOnScreen } from 'lib/useOnScreenRef';

const PAGE_LIMIT = 10;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      loans: await subgraphLoans(PAGE_LIMIT),
    },
  };
};

const getKey = (pageIndex: any, previousPageData: any, pageSize: any) => {
  if (previousPageData && !previousPageData.length) return null; // reached the end

  return `/api/loans/all?limit=${pageSize}&page=${pageIndex + 2}`;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type HomeProps = {
  loans: SubgraphLoan[];
};
export default function Home({ loans }: HomeProps) {
  const ref = useRef();
  const isVisible = useOnScreen(ref);

  const [searchedLoans, setSearchedLoans] = useState<
    SubgraphLoan[] | undefined
  >(undefined);

  const [renderedLoans, setRenderedLoans] = useState<SubgraphLoan[]>(loans);

  const { data, setSize, isValidating } = useSWRInfinite(
    (...args) => getKey(...args, PAGE_LIMIT),
    fetcher,
    {
      initialSize: 0,
    },
  );

  useEffect(() => {
    if (data?.length === 0 || !data) return;
    setRenderedLoans((prevLoans) => [...prevLoans, ...data[data.length - 1]]);
  }, [data]);

  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_LIMIT);

  useEffect(() => {
    if (isVisible && !isReachingEnd && !isValidating) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isVisible, isReachingEnd, isValidating, setSize]);

  return (
    <>
      <AdvancedSearch
        handleSearchFinished={(loans) => setSearchedLoans(loans)}
      />
      <FiveColumn>
        {(searchedLoans || renderedLoans).map((loan) => (
          <LoanCard key={loan.id.toString()} loan={parseSubgraphLoan(loan)} />
        ))}
      </FiveColumn>

      <div ref={ref}>
        <p>
          Welcome! Homepage in progress, try{' '}
          <Link href="/loans/create"> Creating a loan</Link>
        </p>
        {process.env.NEXT_PUBLIC_ENV === 'rinkeby' && (
          <Link href="/test">Get Rinkeby DAI and an NFT!</Link>
        )}
      </div>
    </>
  );
}
