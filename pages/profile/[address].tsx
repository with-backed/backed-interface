import { GetServerSideProps } from 'next';
import React, { useCallback, useMemo, useState } from 'react';
import {
  getAllActiveLoansForAddress,
  getAllEventsForAddress,
} from 'lib/loans/subgraph/getAllLoansEventsForAddress';
import { Loan as RawSubgraphLoan } from 'types/generated/graphql/nftLoans';
import { ProfileHeader } from 'components/Profile/ProfileHeader';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { resolveEns } from 'lib/account';
import { Event } from 'types/Event';
import { parseSerializedResponse } from 'lib/parseSerializedResponse';
import { ProfileActivity } from 'components/ProfileActivity';
import { Toggle } from 'components/Toggle';
import { ProfileLoans } from 'components/Profile/ProfileLoans';
import styles from './[address].module.css';

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

  const eventsList = Object.entries(events)
    .reduce((acc, [_, events]) => [...acc, ...events], [] as Event[])
    .sort((a, b) => b.blockNumber - a.blockNumber);

  return {
    props: {
      address,
      loans,
      events: JSON.stringify(eventsList),
    },
  };
};

export default function Profile({ address, loans, events }: ProfilePageProps) {
  const [showingActivity, setShowingActivity] = useState(true);
  const parsedLoans = useMemo(() => loans.map(parseSubgraphLoan), [loans]);
  const parsedEvents = useMemo(
    () => parseSerializedResponse(events) as Event[],
    [events],
  );

  return (
    <>
      <ProfileHeader address={address} loans={parsedLoans} />
      {parsedLoans.length > 0 && (
        <div className={styles.wrapper}>
          <Toggle
            handleChange={setShowingActivity}
            left="Activity"
            right="Loans"
          />
          {showingActivity ? (
            <ProfileActivity events={parsedEvents} loans={parsedLoans} />
          ) : (
            <ProfileLoans address={address} loans={parsedLoans} />
          )}
        </div>
      )}
    </>
  );
}
