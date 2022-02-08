import { GetServerSideProps } from 'next';
import React from 'react';
import { getAllActiveLoansForAddress } from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as RawSubgraphLoan } from 'types/generated/graphql/nftLoans';
import { ProfileHeader } from 'components/Profile/ProfileHeader';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { ProfileLoans } from 'components/Profile/ProfileLoans';
import { resolveEns } from 'lib/account';

export type ProfilePageProps = {
  address: string;
  loans: RawSubgraphLoan[];
};

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  context,
) => {
  const rawAddress = context.params?.address as string;

  const address = (await resolveEns(rawAddress)) || rawAddress;

  const allLoansForAddress = await getAllActiveLoansForAddress(address);

  return {
    props: {
      address,
      loans: allLoansForAddress,
    },
  };
};

export default function Profile({ address, loans }: ProfilePageProps) {
  return (
    <>
      <ProfileHeader
        address={address}
        loans={loans.map((l) => parseSubgraphLoan(l))}
      />
      <ProfileLoans
        address={address}
        loans={loans.map((l) => parseSubgraphLoan(l))}
      />
    </>
  );
}
