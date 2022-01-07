import { FiveColumn } from 'components/layouts/FiveColumn';
import { LoanCard } from 'components/LoanCard';
import subgraphLoans, { searchLoans } from 'lib/loans/subgraph/subgraphLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { Loan, Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AdvancedSearch } from 'components/AdvancedSearch/AdvancedSearch';

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      loans: await subgraphLoans(),
    },
  };
};

type HomeProps = {
  loans: SubgraphLoan[];
};
export default function Home({ loans }: HomeProps) {
  const [searchedLoans, setSearchedLoans] = useState<Loan[] | undefined>(
    undefined,
  );

  return (
    <>
      <AdvancedSearch
        handleSearchFinished={(loans) => setSearchedLoans(loans)}
      />
      <FiveColumn>
        {(searchedLoans || loans).map((loan) => (
          <LoanCard key={loan.id.toString()} loan={parseSubgraphLoan(loan)} />
        ))}
      </FiveColumn>

      <p>
        Welcome! Homepage in progress, try{' '}
        <Link href="/loans/create"> Creating a loan</Link>
      </p>
      {process.env.NEXT_PUBLIC_ENV === 'rinkeby' && (
        <Link href="/test">Get Rinkeby DAI and an NFT!</Link>
      )}
    </>
  );
}
