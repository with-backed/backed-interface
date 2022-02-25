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
};

const lender = 'Lender';
const borrower = 'Borrower';

const actionToRelationship = {
  BuyoutEvent: lender,
  CloseEvent: borrower,
  CollateralSeizureEvent: lender,
  CreateEvent: borrower,
  LendEvent: lender,
  RepaymentEvent: borrower,
};

export function ProfileActivity({ events, loans }: ProfileActivityProps) {
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
            return (
              <tr key={`${e.id}-${e.typename}`}>
                <td>
                  <Relationship typename={e.typename} />
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

type RelationshipProps = Pick<Event, 'typename'>;
function Relationship({ typename }: RelationshipProps) {
  const relationship = useMemo(
    () => actionToRelationship[typename],
    [typename],
  );
  return <span className={styles[relationship]}>{relationship}</span>;
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
