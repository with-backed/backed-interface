import { DisplayAddress } from 'components/DisplayAddress';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { renderEventName } from 'lib/text';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Event } from 'types/Event';
import { Loan } from 'types/Loan';
import styles from './ProfileActivity.module.css';

type ProfileActivityProps = {
  events: Event[];
  loans: Loan[];
  profileAddress: string;
};

function getUserForEvent(event: Event, loan: Loan) {
  switch (event.typename) {
    case 'BuyoutEvent':
      return event.underwriter;
    case 'CloseEvent':
      return loan.borrower;
    case 'CollateralSeizureEvent':
      return loan.lender!;
    case 'CreateEvent':
      return event.minter;
    case 'LendEvent':
      return event.underwriter;
    case 'RepaymentEvent':
      return event.repayer;
  }
}

export function ProfileActivity({
  events,
  loans,
  profileAddress,
}: ProfileActivityProps) {
  const loanLookup = useMemo(() => {
    const table: { [key: string]: Loan } = {};
    loans.forEach((l) => (table[l.id.toString()] = l));
    return table;
  }, [loans]);

  return (
    <TwelveColumn>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Event</th>
            <th>Time</th>
            <th>Collateral</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const loan = loanLookup[e.loanId.toString()];
            const user = getUserForEvent(e, loan);

            console.log({ user, profileAddress });
            return (
              <tr key={`${e.id}-${e.typename}`}>
                <td>
                  <div
                    className={
                      user === profileAddress
                        ? styles['profile-owner']
                        : styles.user
                    }>
                    <DisplayAddress address={user} />
                  </div>
                </td>
                <td>
                  <EventLink id={e.id} typename={e.typename} />
                </td>
                <td>
                  <EventDate timestamp={e.timestamp} />
                </td>
                <td>
                  <EventCollateral loan={loan} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TwelveColumn>
  );
}

type EventDateProps = Pick<Event, 'timestamp'>;
function EventDate({ timestamp }: EventDateProps) {
  const date = useMemo(
    () => new Date(timestamp * 1000).toLocaleString(),
    [timestamp],
  );
  return <span>{date}</span>;
}

type EventLinkProps = Pick<Event, 'typename' | 'id'>;
function EventLink({ id, typename }: EventLinkProps) {
  return (
    <div className={styles['event-link']}>
      <EtherscanTransactionLink transactionHash={id}>
        {renderEventName(typename)} 🔗
      </EtherscanTransactionLink>
    </div>
  );
}

type EventCollateralProps = {
  loan: Loan;
};
function EventCollateral({ loan }: EventCollateralProps) {
  const tokenSpec = useMemo(
    () => ({
      tokenURI: loan.collateralTokenURI,
      tokenID: loan.collateralTokenId,
    }),
    [loan.collateralTokenURI, loan.collateralTokenId],
  );
  const { metadata, isLoading } = useTokenMetadata(tokenSpec);
  return (
    <Link href={`/loans/${loan.id.toString()}`}>
      <a className={styles.collateral}>
        <NFTMedia
          collateralAddress={loan.collateralContractAddress}
          collateralTokenID={loan.collateralTokenId}
          small
          forceImage
        />
        <div className={styles['name-and-collection']}>
          <span className={styles.name}>
            {isLoading ? '---' : metadata?.name}
          </span>
          <span className={styles.collection}>{loan.collateralName}</span>
        </div>
      </a>
    </Link>
  );
}
