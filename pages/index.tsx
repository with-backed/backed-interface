import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan as SubgraphLoan,
  LoanStatus,
} from 'types/generated/graphql/nftLoans';
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import { AdvancedSearch, SearchHeader } from 'components/AdvancedSearch';
import searchStyles from 'components/AdvancedSearch/AdvancedSearch.module.css';
import { usePaginatedLoans } from 'hooks/usePaginatedLoans';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { SortOptionValue } from 'components/AdvancedSearch/SortDropdown';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';
import { LoanTable } from 'components/LoanTable';
import { LoanCard } from 'components/LoanCard';
import { LoanGalleryLoadMore } from 'components/LoanGalleryLoadMore';

const PAGE_LIMIT = 12;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      loans: await subgraphLoans(PAGE_LIMIT),
    },
  };
};

type HomeProps = {
  loans: SubgraphLoan[];
};
export default function Home({ loans }: HomeProps) {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchUrl, setSearchUrl] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOptionValue | undefined>(
    undefined,
  );
  const [statuses, setStatuses] = useState<LoanStatus[]>([
    LoanStatus.AwaitingLender,
    LoanStatus.Active,
  ]);

  const [showGrid, setShowGrid] = useState(true);

  const { paginatedLoans, loadMore, isReachingEnd, isLoadingMore } =
    usePaginatedLoans(
      searchActive ? searchUrl : '/api/loans/all?',
      PAGE_LIMIT,
      selectedSort,
      loans,
    );

  return (
    <>
      <Head>
        <title>Backed | Home</title>
        <meta
          name="description"
          content="Welcome to Backed protocol. View existing loans, lend against NFTs, or propose loan terms on your own NFTs."
        />
      </Head>
      <PawnShopHeader showInitialInfo />
      <TwelveColumn>
        <div className={searchStyles.wrapper}>
          <SearchHeader
            setStatuses={setStatuses}
            setSelectedSort={setSelectedSort}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            handleViewChange={setShowGrid}
          />
          <AdvancedSearch
            showSearch={showSearch}
            setSearchActive={setSearchActive}
            setSearchUrl={setSearchUrl}
            loanAssetDecimalsForSearch={paginatedLoans[0]?.loanAssetDecimals}
            statuses={statuses}
            setStatuses={setStatuses}
          />
        </div>

        {showGrid ? (
          paginatedLoans.map((loan) => (
            <LoanCard loan={loan} display="compact" key={loan.id.toString()} />
          ))
        ) : (
          <LoanTable loans={paginatedLoans} />
        )}

        <LoanGalleryLoadMore
          isLoadingMore={isLoadingMore}
          isReachingEnd={isReachingEnd}
          loadMore={loadMore}
        />
      </TwelveColumn>
    </>
  );
}
