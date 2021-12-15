import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { LoanCard, Loan } from 'components/LoanCard';
import { nftBackedLoansClient } from 'lib/urql';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React from 'react';

const homepageQuery = `
query {
  loans(where: { closed: false}, first: 20, orderBy: createdAtTimestamp, orderDirection: desc) {
    collateralTokenId
    collateralTokenURI
    id
    loanAmount
    loanAssetSymbol
    loanAssetDecimal
    perSecondInterestRate
  }
}
`;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const {
      data: { loans },
    } = await nftBackedLoansClient.query(homepageQuery).toPromise();

    return {
      props: {
        loans: loans as Loan[],
      },
    };
  } catch (e) {
    // TODO: log this error somewhere
    return {
      props: {
        loans: [],
      },
    };
  }
};

type HomeProps = {
  loans: Loan[];
};
export default function Home({ loans }: HomeProps) {
  return (
    <>
      <ThreeColumn>
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
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
