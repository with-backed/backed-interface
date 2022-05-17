import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { MaybeNFTMetadata, useTokenMetadata } from 'hooks/useTokenMetadata';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { renderEventName } from 'lib/text';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Event } from 'types/Event';
import { Loan } from 'types/Loan';
import styles from './ProfileActivity.module.css';

const MAX_CHARS = 6;

type ProfileActivityProps = {
  address: string;
  events: Event[];
};

export function ProfileActivity({ address, events }: ProfileActivityProps) {
  return (
    <TwelveColumn>
      <ul className={styles['event-list']}>
        {events.map((e) => {
          return (
            <EventEntry
              key={`${e.id}-${e.typename}`}
              address={address}
              event={e}
            />
          );
        })}
      </ul>
    </TwelveColumn>
  );
}

type EventEntryProps = {
  address: string;
  event: Event;
};
function EventEntry({ address, event }: EventEntryProps) {
  const loan = useMemo(() => {
    return parseSubgraphLoan(event.loan);
  }, [event.loan]);
  const tokenSpec = useMemo(
    () => ({
      collateralContractAddress: loan.collateralContractAddress,
      collateralTokenId: loan.collateralTokenId,
      forceImage: true,
    }),
    [loan.collateralContractAddress, loan.collateralTokenId],
  );
  const nftInfo = useTokenMetadata(tokenSpec);

  return (
    <li className={styles.event}>
      <EventLink
        id={event.id}
        timestamp={event.timestamp}
        typename={event.typename}
      />
      <NFTMedia nftInfo={nftInfo} small />
      <EventDescription
        address={address}
        event={event}
        loan={loan}
        nftInfo={nftInfo}
      />
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
  address: string;
  loan: Loan;
  event: Event;
  nftInfo: MaybeNFTMetadata;
};
function EventDescription({
  address,
  event,
  loan,
  nftInfo,
}: EventDescriptionProps) {
  const { network } = useConfig();
  const description: JSX.Element = useMemo(() => {
    switch (event.typename) {
      case 'BuyoutEvent':
        return (
          <span className={styles.description}>
            <Address address={event.underwriter} highlightAddress={address} />{' '}
            paid{' '}
            <Address
              address={event.replacedLoanOwner}
              highlightAddress={address}
            />{' '}
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
          <span className={styles.description}>
            <Address address={loan.borrower} highlightAddress={address} />{' '}
            closed this loan before anyone underwrote it.
          </span>
        );
      case 'CollateralSeizureEvent':
        return (
          <span className={styles.description}>{loan.lender} seized NFT</span>
        );
      case 'CreateEvent':
        return (
          <span className={styles.description}>
            <Address address={event.minter} highlightAddress={address} />{' '}
            requested{' '}
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
          <span className={styles.description}>
            <Address address={event.underwriter} highlightAddress={address} />{' '}
            lent{' '}
            {ethers.utils.formatUnits(event.loanAmount, loan.loanAssetDecimals)}{' '}
            {loan.loanAssetSymbol} for{' '}
            {secondsBigNumToDays(event.durationSeconds).toFixed(4)} days at{' '}
            {formattedAnnualRate(event.interestRate)}% interest.
          </span>
        );
      case 'RepaymentEvent':
        return (
          <span className={styles.description}>
            {event.repayer} repaid{' '}
            {ethers.utils.formatUnits(
              event.loanAmount.add(event.interestEarned),
              loan.loanAssetDecimals,
            )}{' '}
            {loan.loanAssetSymbol}.
          </span>
        );
    }
  }, [address, event, loan]);
  const name =
    nftInfo.isLoading || !nftInfo.metadata ? '---' : nftInfo.metadata.name;
  return (
    <div className={styles['description-wrapper']}>
      <Link href={`/network/${network}/loans/${loan.id.toString()}`}>
        <a>{name}</a>
      </Link>
      {description}
    </div>
  );
}

type AddressProps = {
  address: string;
  highlightAddress: string;
};
function Address({ address, highlightAddress }: AddressProps) {
  const { network } = useConfig();
  const className =
    address === highlightAddress ? styles['highlight-address'] : styles.address;
  return (
    <Link href={`/network/${network}/profile/${address}`}>
      <a className={className}>{address.slice(0, MAX_CHARS)}</a>
    </Link>
  );
}
