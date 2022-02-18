import { GetServerSideProps } from 'next';
import React, { useMemo } from 'react';
import {
  getAllActiveLoansForAddress,
  getAllEventsForAddress,
} from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as RawSubgraphLoan } from 'types/generated/graphql/nftLoans';
import { ProfileHeader } from 'components/Profile/ProfileHeader';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { resolveEns } from 'lib/account';
import { Event } from 'types/Event';
import { Dictionary } from 'lodash';
import { parseSerializedResponse } from 'lib/parseSerializedResponse';
import { ProfileActivity } from 'components/ProfileActivity';

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
  const parsedEvents = useMemo(() => {
    const groupedEvents = parseSerializedResponse(events) as Dictionary<
      [Event, ...Event[]]
    >;
    return Object.entries(groupedEvents)
      .reduce((acc, [_, events]) => {
        return [...acc, ...events];
      }, [] as Event[])
      .sort((a, b) => a.blockNumber - b.blockNumber);
  }, [events]);

  return (
    <>
      <ProfileHeader address={address} loans={parsedLoans} />
      <ProfileActivity events={parsedEvents} />
    </>
  );
}
