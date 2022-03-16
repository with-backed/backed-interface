import { DisplayAddress } from 'components/DisplayAddress';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import { MaybeNFTMetadata, useTokenMetadata } from 'hooks/useTokenMetadata';
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

export function ProfileActivity({ events, loans }: ProfileActivityProps) {
  const loanLookup = useMemo(() => {
    const table: { [key: string]: Loan } = {};
    loans.forEach((l) => (table[l.id.toString()] = l));
    return table;
  }, [loans]);

  return (
    <TwelveColumn>
      <ul className={styles['event-list']}>
        {events.map((e) => {
          const loan = loanLookup[e.loanId.toString()];
          if (!loan) {
            // TODO: bugsnag
            // Sometimes an event points to a loanId that we don't have.
            // Unsure whether this is due to query being limited, will have
            // to investigate.
            return null;
          }
          return (
            <EventEntry key={`${e.id}-${e.typename}`} loan={loan} event={e} />
          );
        })}
      </ul>
    </TwelveColumn>
  );
}

type EventEntryProps = {
  loan: Loan;
  event: Event;
};
function EventEntry({ event, loan }: EventEntryProps) {
  const tokenSpec = useMemo(
    () => ({
      tokenURI: loan.collateralTokenURI,
      tokenID: loan.collateralTokenId,
      forceImage: true,
    }),
    [loan.collateralTokenURI, loan.collateralTokenId],
  );
  const nftInfo = useTokenMetadata(tokenSpec);

  return (
    <li className={styles.event}>
      <EventLink
        id={event.id}
        timestamp={event.timestamp}
        typename={event.typename}
      />
      <NFTMedia nftInfo={nftInfo} />
      <EventDescription event={event} loan={loan} nftInfo={nftInfo} />
    </li>
  );
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
        {renderEventName(typename)}&nbsp;🔗
      </EtherscanTransactionLink>
      <span>{date}</span>
    </div>
  );
}

type EventDescriptionProps = {
  loan: Loan;
  event: Event;
  nftInfo: MaybeNFTMetadata;
};
function EventDescription({ event, loan, nftInfo }: EventDescriptionProps) {
  const description: JSX.Element = useMemo(() => {
    switch (event.typename) {
      case 'BuyoutEvent':
        return (
          <span>
            {event.underwriter} paid {event.replacedLoanOwner}{' '}
            {ethers.utils.formatUnits(
              event.interestEarned,
              loan.loanAssetDecimals,
            )}{' '}
            (accrued interest) and{' '}
            {ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals)}{' '}
            (principal).
          </span>
        );
      case 'CloseEvent':
        return (
          <span>
            {loan.borrower} closed this loan before anyone underwrote it.
          </span>
        );
      case 'CollateralSeizureEvent':
        return <span>{loan.lender} seized NFT</span>;
      case 'CreateEvent':
        return (
          <span>
            {event.minter} requested{' '}
            {ethers.utils.formatUnits(
              event.minLoanAmount,
              loan.loanAssetDecimals,
            )}{' '}
            {loan.loanAssetSymbol} for{' '}
            {secondsBigNumToDays(event.minDurationSeconds).toFixed(4)} days at{' '}
            {formattedAnnualRate(event.maxInterestRate)}% interest.
          </span>
        );
      case 'LendEvent':
        return (
          <span>
            {event.underwriter} lent{' '}
            {ethers.utils.formatUnits(event.loanAmount, loan.loanAssetDecimals)}{' '}
            {loan.loanAssetSymbol} for{' '}
            {secondsBigNumToDays(event.durationSeconds).toFixed(4)} days at{' '}
            {formattedAnnualRate(event.interestRate)}% interest.
          </span>
        );
      case 'RepaymentEvent':
        return (
          <span>
            {event.repayer} repaid{' '}
            {ethers.utils.formatUnits(
              event.loanAmount.add(event.interestEarned),
              loan.loanAssetDecimals,
            )}{' '}
            {loan.loanAssetSymbol}.
          </span>
        );
    }
  }, [event, loan]);
  return (
    <div className={styles.description}>
      <Link href={`/loans/${loan.id.toString()}`}>
        <a>{nftInfo.isLoading ? '--' : nftInfo.metadata?.name}</a>
      </Link>
      {description}
    </div>
  );
}
