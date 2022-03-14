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

type ProfileLoanCardProps = {
  loan: Loan;
  selectedAddress: string;
};

export function ProfileLoanCard({
  loan,
  selectedAddress,
}: ProfileLoanCardProps) {
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
  const attributes = useMemo(() => <Attributes loan={loan} />, [loan]);

  if (maybeMetadata.isLoading) {
    return (
      <ProfileLoanCardLoading relationship={relationship}>
        {attributes}
      </ProfileLoanCardLoading>
    );
  } else {
    return (
      <ProfileLoanCardLoaded
        id={loan.id.toString()}
        title={title}
        metadata={maybeMetadata.metadata}
        relationship={relationship}>
        {attributes}
      </ProfileLoanCardLoaded>
    );
  }
}

type ProfileLoanCardLoadedProps = {
  id: string;
  title: string;
  metadata: GetNFTInfoResponse | null;
  relationship: string;
};

/**
 * Only exported for the Storybook. Please use top-level ProfileLoanCard.
 */
export function ProfileLoanCardLoaded({
  id,
  title,
  metadata,
  relationship,
  children,
}: React.PropsWithChildren<ProfileLoanCardLoadedProps>) {
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
            <Relationship>{relationship}</Relationship>
            {children}
          </div>
        </div>
      </a>
    </Link>
  );
}

type ProfileLoanCardLoadingProps = {
  relationship: string;
};

/**
 * Only exported for the Storybook. Please use top-level ProfileLoanCard.
 */
export function ProfileLoanCardLoading({
  children,
  relationship,
}: React.PropsWithChildren<ProfileLoanCardLoadingProps>) {
  return (
    <a className={styles['profile-link']}>
      <div className={styles['profile-card']}>
        <Fallback />
        <div className={styles['profile-card-attributes']}>
          <span>loading name</span>
          <Relationship>{relationship}</Relationship>
          {children}
        </div>
      </div>
    </a>
  );
}

type AttributesProps = {
  loan: Loan;
};
export const Attributes = ({ loan }: AttributesProps) => {
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
        <dt>remaining</dt>
        <dd>{formattedTimeRemaining}</dd>
      </div>
    </DescriptionList>
  );
};

const Relationship: React.FunctionComponent = ({ children }) => {
  return <span className={styles.relationship}>{children}</span>;
};
