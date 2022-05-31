import Link from 'next/link';
import React, { memo, useMemo } from 'react';
import styles from './LoanCard.module.css';
import { CollateralSpec, useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fallback } from 'components/Media/Fallback';
import { Loan } from 'types/Loan';
import { DescriptionList } from 'components/DescriptionList';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { useConfig } from 'hooks/useConfig';

type LoanCardProps = {
  loan: Loan;
  selectedAddress?: string;
  display?: 'expanded' | 'compact';
};

export const LoanCard = memo(
  ({ loan, selectedAddress, display = 'expanded' }: LoanCardProps) => {
    const title = `View loan #${loan.id}`;

    const tokenSpec: CollateralSpec = useMemo(
      () => ({
        collateralContractAddress: loan.collateralContractAddress,
        collateralTokenId: loan.collateralTokenId,
        forceImage: true,
      }),
      [loan.collateralTokenId, loan.collateralContractAddress],
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
        <LoanCardLoading id={loan.id.toString()}>
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
  },
  (prevProps, nextProps) => {
    if (prevProps.display !== nextProps.display) {
      return false;
    }

    if (prevProps.selectedAddress !== nextProps.selectedAddress) {
      return false;
    }

    if (!prevProps.loan.id.eq(nextProps.loan.id)) {
      return false;
    }

    return true;
  },
);

LoanCard.displayName = 'LoanCard';

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
  const { network } = useConfig();
  return (
    <Link href={`/network/${network}/loans/${id}`}>
      <a className={styles['profile-link']} aria-label={title} title={title}>
        <div className={styles['profile-card']}>
          <div className={styles.media}>
            {metadata && (
              <Media
                media={metadata.mediaUrl}
                mediaMimeType={metadata.mediaMimeType}
                autoPlay={false}
              />
            )}
            {!metadata && <Fallback animated={false} />}
          </div>

          <div className={styles['profile-card-attributes']}>
            <span>{metadata ? metadata.name : '--'}</span>
            {children}
          </div>
        </div>
      </a>
    </Link>
  );
}

type LoanCardLoadingProps = { id: string };

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoading({
  children,
  id,
}: React.PropsWithChildren<LoanCardLoadingProps>) {
  const { network } = useConfig();
  return (
    <Link href={`/network/${network}/loans/${id}`}>
      <a className={styles['profile-link']}>
        <div className={styles['profile-card']}>
          <div className={styles.media}>
            <Fallback />
          </div>
          <div className={styles['profile-card-attributes']}>
            <span>loading name</span>
            {children}
          </div>
        </div>
      </a>
    </Link>
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
    formattedStatus,
    formattedTotalDuration,
    formattedTimeRemaining,
  } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <dt>Amount</dt>
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
        <dt>{statusLabel(formattedStatus)}</dt>
        <dd>
          {formattedStatus === 'Accruing interest'
            ? formattedTimeRemaining
            : formattedStatus}
        </dd>
      </div>
    </DescriptionList>
  );
};

export const CompactAttributes = ({ loan }: AttributesProps) => {
  const {
    formattedPrincipal,
    formattedInterestRate,
    formattedStatus,
    formattedTimeRemaining,
    formattedTotalDuration,
  } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <div className={styles['stacked-entry']}>
        <dt>Amount</dt>
        <dd>{formattedPrincipal}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>interest</dt>
        <dd>{formattedInterestRate}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>duration</dt>
        <dd>{formattedTotalDuration}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>{statusLabel(formattedStatus)}</dt>
        <dd>
          {formattedStatus === 'Accruing interest'
            ? formattedTimeRemaining
            : formattedStatus}
        </dd>
      </div>
    </DescriptionList>
  );
};

export const Relationship: React.FunctionComponent = ({ children }) => {
  return <span className={styles.relationship}>{children}</span>;
};

function statusLabel(status: string) {
  if (status === 'Accruing interest') {
    return 'time left';
  }
  return 'status';
}
