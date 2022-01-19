import { GetServerSideProps } from 'next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllActiveLoansForAddress } from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as RawSubgraphLoan } from 'types/generated/graphql/nftLoans';
import { ProfileHeader } from 'components/Profile/ProfileHeader';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { ProfileLoans } from 'components/Profile/ProfileLoans';
import { Loan } from 'types/Loan';

export type ProfilePageProps = {
  address: string;
  loans: RawSubgraphLoan[];
};

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  context,
) => {
  const address = context.params?.address as string;

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
