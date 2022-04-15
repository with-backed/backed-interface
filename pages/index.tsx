import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { AdvancedSearch, SearchHeader } from 'components/AdvancedSearch';
import searchStyles from '../components/AdvancedSearch/AdvancedSearch.module.css';
import { usePaginatedLoans } from 'hooks/usePaginatedLoans';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { SortOptionValue } from 'components/AdvancedSearch/SortDropdown';
import { HomePageLoans } from 'components/HomePageLoans';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';
import text from '../text/text.yml';

const PAGE_LIMIT = 20;

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

String.prototype.interpolate = function (params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
};

export default function Home({ loans }: HomeProps) {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchUrl, setSearchUrl] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOptionValue | undefined>(
    undefined,
  );
  const [showGrid, setShowGrid] = useState(true);

  const { paginatedLoans } = usePaginatedLoans(
    searchActive ? searchUrl : '/api/loans/all?',
    ref,
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
      <PawnShopHeader />
      <TwelveColumn>
        <div className={searchStyles.wrapper}>
          <SearchHeader
            setSelectedSort={setSelectedSort}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            handleViewChange={setShowGrid}
          />
          <AdvancedSearch
            showSearch={showSearch}
            searchActive={searchActive}
            setSearchActive={setSearchActive}
            setSearchUrl={setSearchUrl}
            loanAssetDecimalsForSearch={paginatedLoans[0]?.loanAssetDecimal}
          />
        </div>

        <HomePageLoans
          loans={paginatedLoans.map(parseSubgraphLoan)}
          view={showGrid ? 'cards' : 'list'}
        />

        <div ref={ref} style={{ gridColumn: 'span 12' }}>
          <p>
            {text.en.homepage}, try{' '}
            <Link href="/loans/create"> Creating a loan</Link>
          </p>
          {process.env.NEXT_PUBLIC_ENV === 'rinkeby' && (
            <Link href="/test">Get Rinkeby DAI and an NFT!</Link>
          )}
        </div>
      </TwelveColumn>
    </>
  );
}
