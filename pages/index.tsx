import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { LoanCard } from 'components/LoanCard';
import { loans } from 'lib/loans/loans';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import { loanFromSubgraphLoan } from 'lib/loans/utils/loanFromSubgraphLoan';
import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React from 'react';

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
  return (
    <>
      <ThreeColumn>
        {loans.map((loan) => (
          <LoanCard
            key={loan.id.toString()}
            loan={loanFromSubgraphLoan(loan)}
          />
        ))}
      </ThreeColumn>

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
