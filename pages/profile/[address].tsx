import { GetServerSideProps } from 'next';
import React, { useMemo } from 'react';
import {
  getAllActiveLoansForAddress,
  getAllEventsForAddress,
} from 'lib/loans/subgraph/getAllLoansEventsForAddress';
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
  const events = await getAllEventsForAddress(address);

  console.dir({ events }, { depth: null });

  return {
    props: {
      address,
      loans: allLoansForAddress,
    },
  };
};

export default function Profile({ address, loans }: ProfilePageProps) {
  const parsedLoans = useMemo(() => loans.map(parseSubgraphLoan), [loans]);
  return (
    <>
      <ProfileHeader address={address} loans={parsedLoans} />
      <ProfileLoans address={address} loans={parsedLoans} />
    </>
  );
}
