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
import { LoanTable } from 'components/LoanTable';
import { LoanCard } from 'components/LoanCard';
import { LoanGalleryLoadMore } from 'components/LoanGalleryLoadMore';
import { captureException } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';
import { useConfig } from 'hooks/useConfig';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL } from 'lib/constants';
import capitalize from 'lodash/capitalize';

const PAGE_LIMIT = 12;

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context,
) => {
  try {
    validateNetwork(context.params!);
    const network = context.params?.network as SupportedNetwork;
    const config = configs[network];
    return {
      props: {
        loans: await subgraphLoans(PAGE_LIMIT, config.nftBackedLoansSubgraph),
      },
    };
  } catch (e) {
    captureException(e);
    return {
      notFound: true,
    };
  }
};

type HomeProps = {
  loans: SubgraphLoan[];
};
export default function Home({ loans }: HomeProps) {
  const { network } = useConfig();
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
      searchActive ? searchUrl : `/api/network/${network}/loans/all?`,
      PAGE_LIMIT,
      selectedSort,
      loans,
    );

  return (
    <>
      <OpenGraph
        title={`Backed | ${capitalize(network)} | Home`}
        description="Welcome to Backed protocol - NFT Lending. View existing loans, lend against NFTs, or propose loan terms on your own NFTs."
        imageUrl={BUNNY_IMG_URL}
      />
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
