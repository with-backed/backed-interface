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
import { Event } from 'types/Event';
import { Dictionary } from 'lodash';
import { parseSerializedResponse } from 'lib/parseSerializedResponse';

export type ProfilePageProps = {
  address: string;
  loans: RawSubgraphLoan[];
  events: string;
};

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  context,
) => {
  const rawAddress = context.params?.address as string;

  const address = (await resolveEns(rawAddress)) || rawAddress;

  const [events, loans] = await Promise.all([
    getAllEventsForAddress(address),
    getAllActiveLoansForAddress(address),
  ]);

  return {
    props: {
      address,
      loans,
      events: JSON.stringify(events),
    },
  };
};

export default function Profile({ address, loans, events }: ProfilePageProps) {
  const parsedLoans = useMemo(() => loans.map(parseSubgraphLoan), [loans]);
  const parsedEvents = useMemo(
    () => parseSerializedResponse(events) as Dictionary<[Event, ...Event[]]>,
    [events],
  );

  return (
    <>
      <ProfileHeader address={address} loans={parsedLoans} />
      <ProfileLoans address={address} loans={parsedLoans} />
    </>
  );
}
