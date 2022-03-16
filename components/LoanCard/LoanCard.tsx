import { ethers } from 'ethers';
import Link from 'next/link';
import React, { useMemo } from 'react';
import styles from './LoanCard.module.css';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fallback } from 'components/Media/Fallback';
import { Loan } from 'types/Loan';
import { DescriptionList } from 'components/DescriptionList';
import { useLoanDetails } from 'hooks/useLoanDetails';

type LoanCardProps = {
  loan: Loan;
  selectedAddress?: string;
  display?: 'expanded' | 'compact';
};

export function LoanCard({
  loan,
  selectedAddress,
  display = 'expanded',
}: LoanCardProps) {
  const title = `View loan #${loan.id}`;

  const tokenSpec = useMemo(
    () => ({
      tokenURI: loan.collateralTokenURI,
      tokenID: ethers.BigNumber.from(loan.collateralTokenId),
    }),
    [loan.collateralTokenId, loan.collateralTokenURI],
  );

  const maybeMetadata = useTokenMetadata(tokenSpec);

  const relationship =
    selectedAddress === loan.borrower ? 'borrower' : 'lender';
  const attributes = useMemo(
    () =>
      display === 'expanded' ? (
        <ExpandedAttributes loan={loan} />
      ) : (
        <CompactAttributes loan={loan} />
      ),
    [display, loan],
  );

  if (maybeMetadata.isLoading) {
    return (
      <LoanCardLoading>
        {selectedAddress && <Relationship>{relationship}</Relationship>}
        {attributes}
      </LoanCardLoading>
    );
  } else {
    return (
      <LoanCardLoaded
        id={loan.id.toString()}
        title={title}
        metadata={maybeMetadata.metadata}>
        {selectedAddress && <Relationship>{relationship}</Relationship>}
        {attributes}
      </LoanCardLoaded>
    );
  }
}

type LoanCardLoadedProps = {
  id: string;
  title: string;
  metadata: GetNFTInfoResponse | null;
};

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoaded({
  id,
  title,
  metadata,
  children,
}: React.PropsWithChildren<LoanCardLoadedProps>) {
  return (
    <Link href={`/loans/${id}`}>
      <a className={styles['profile-link']} aria-label={title} title={title}>
        <div className={styles['profile-card']}>
          {metadata && (
            <Media
              media={metadata.mediaUrl}
              mediaMimeType={metadata.mediaMimeType}
              autoPlay={false}
            />
          )}
          {!metadata && <Fallback animated={false} />}
          <div className={styles['profile-card-attributes']}>
            <span>{metadata ? metadata.name : '--'}</span>
            {children}
          </div>
        </div>
      </a>
    </Link>
  );
}

type LoanCardLoadingProps = {};

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoading({
  children,
}: React.PropsWithChildren<LoanCardLoadingProps>) {
  return (
    <a className={styles['profile-link']}>
      <div className={styles['profile-card']}>
        <Fallback />
        <div className={styles['profile-card-attributes']}>
          <span>loading name</span>

          {children}
        </div>
      </div>
    </a>
  );
}

type AttributesProps = {
  loan: Loan;
};
export const ExpandedAttributes = ({ loan }: AttributesProps) => {
  const {
    formattedPrincipal,
    formattedInterestRate,
    formattedInterestAccrued,
    formattedTotalDuration,
    formattedTimeRemaining,
  } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <dt>Loan Amount</dt>
      <dd>{formattedPrincipal}</dd>
      <div className={styles['stacked-entry']}>
        <dt>interest</dt>
        <dd>{formattedInterestRate}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>accrued</dt>
        <dd>{formattedInterestAccrued}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>duration</dt>
        <dd>{formattedTotalDuration}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>status</dt>
        <dd>{formattedTimeRemaining}</dd>
      </div>
    </DescriptionList>
  );
};

export const CompactAttributes = ({ loan }: AttributesProps) => {
  const { formattedPrincipal, formattedInterestRate } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <div className={styles['stacked-entry']}>
        <dt>Loan Amount</dt>
        <dd>{formattedPrincipal}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>interest</dt>
        <dd>{formattedInterestRate}</dd>
      </div>
    </DescriptionList>
  );
};

export const Relationship: React.FunctionComponent = ({ children }) => {
  return <span className={styles.relationship}>{children}</span>;
};
