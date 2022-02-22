import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
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
            <th></th>
            <th>Event</th>
            <th>Collateral</th>
            <th className={styles.right}>Amount</th>
            <th className={styles.right}>Duration</th>
            <th className={styles.right}>Rate</th>
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
                  <EventLink
                    id={e.id}
                    typename={e.typename}
                    timestamp={e.timestamp}
                  />
                </td>
                <td>
                  <EventCollateral loan={loan} />
                </td>
                <td className={styles.right}>
                  <EventAmount event={e} loan={loan} />
                </td>
                <td className={styles.right}>
                  <EventDuration event={e} loan={loan} />
                </td>
                <td className={styles.right}>
                  <EventRate event={e} loan={loan} />
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

type EventDetailProps = {
  event: Event;
  loan: Loan;
};

function EventAmount({ event, loan }: EventDetailProps) {
  const amount = useMemo(() => {
    let amount = loan.loanAmount;
    if (event.typename === 'BuyoutEvent') {
      amount = event.replacedAmount;
    }
    if (event.typename === 'CreateEvent') {
      amount = event.minLoanAmount;
    }
    if (event.typename === 'LendEvent' || event.typename === 'RepaymentEvent') {
      amount = event.loanAmount;
    }

    return ethers.utils.formatUnits(amount, loan.loanAssetDecimals);
  }, [event, loan]);
  return (
    <span>
      {amount} {loan.loanAssetSymbol}
    </span>
  );
}

function EventDuration({ event, loan }: EventDetailProps) {
  const duration = useMemo(() => {
    let duration = loan.durationSeconds;
    if (event.typename === 'CreateEvent') {
      duration = event.minDurationSeconds;
    }
    if (event.typename === 'LendEvent') {
      duration = event.durationSeconds;
    }

    return secondsBigNumToDays(duration);
  }, [event, loan]);
  return <span>{duration} days</span>;
}

function EventRate({ event, loan }: EventDetailProps) {
  const rate = useMemo(() => {
    let rate = loan.perSecondInterestRate;
    if (event.typename === 'CreateEvent') {
      rate = event.maxInterestRate;
    }
    if (event.typename === 'LendEvent') {
      rate = event.interestRate;
    }

    return formattedAnnualRate(rate);
  }, [event, loan]);
  return <span>{rate} %</span>;
}
