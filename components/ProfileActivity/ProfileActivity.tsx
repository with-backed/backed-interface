import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { Fallback } from 'components/Media/Fallback';
import { renderEventName } from 'lib/text';
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
            <th></th>
            <th>Event</th>
            <th>Collateral</th>
            <th>Amount</th>
            <th>Duration</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            return (
              <tr key={`${e.id}-${e.typename}`}>
                <td>
                  <Relationship typename={e.typename} />
                </td>
                <td>
                  <EventLink
                    id={e.id}
                    typename={e.typename}
                    timestamp={e.timestamp}
                  />
                </td>
                <td>
                  <EventCollateral loan={loanLookup[e.loanId.toString()]} />
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

type EventLinkProps = Pick<Event, 'typename' | 'id' | 'timestamp'>;
function EventLink({ id, timestamp, typename }: EventLinkProps) {
  const date = useMemo(
    () => new Date(timestamp * 1000).toLocaleString(),
    [timestamp],
  );
  return (
    <div className={styles['event-link']}>
      <EtherscanTransactionLink transactionHash={id}>
        {renderEventName(typename)} 🔗
      </EtherscanTransactionLink>
      {date}
    </div>
  );
}

type EventCollateralProps = {
  loan: Loan;
};
function EventCollateral({ loan }: EventCollateralProps) {
  console.log(loan);
  return (
    <div className={styles.collateral}>
      <Fallback />
    </div>
  );
}
