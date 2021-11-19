import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import Link from 'next/link';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './LoanCard.module.css';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';

const Attributes: FunctionComponent = ({ children }) => {
  return <div className={styles.attributes}>{children}</div>;
};

type Loan = {
  id: string;
  loanAssetSymbol: string;
  loanAssetDecimal: number;
  loanAmount: string;
  perSecondInterestRate: string;
  collateralTokenURI: string;
  collateralTokenID: string;
};

type LoanCardProps = {
  loan: Loan;
};

export function LoanCard({
  loan: {
    id,
    loanAmount,
    loanAssetDecimal,
    loanAssetSymbol,
    perSecondInterestRate,
    collateralTokenURI,
    collateralTokenID,
  },
}: LoanCardProps) {
  const title = `View loan #${id}`;
  const formattedLoanAmount = useMemo(
    () =>
      `${ethers.utils.formatUnits(
        loanAmount,
        loanAssetDecimal,
      )} ${loanAssetSymbol}`,
    [loanAmount, loanAssetDecimal, loanAssetSymbol],
  );

  const tokenSpec = useMemo(
    () => ({
      tokenURI: collateralTokenURI,
      tokenID: ethers.BigNumber.from(collateralTokenID),
    }),
    [collateralTokenID, collateralTokenURI],
  );

  const maybeMetadata = useTokenMetadata(tokenSpec);

  if (maybeMetadata.isLoading) {
    return <LoanCardLoading />;
  } else if (!maybeMetadata.metadata) {
    // TODO: bugsnag?
    console.error(
      new Error(
        `Failed to fetch metadata at ${collateralTokenURI} for loan #${id}`,
      ),
    );
    return null;
  } else {
    return (
      <LoanCardLoaded
        id={id}
        title={title}
        formattedLoanAmount={formattedLoanAmount}
        perSecondInterestRate={perSecondInterestRate}
        metadata={maybeMetadata.metadata}
      />
    );
  }
}

type LoanCardLoadedProps = {
  id: string;
  title: string;
  formattedLoanAmount: string;
  perSecondInterestRate: string;
  metadata: GetNFTInfoResponse;
};
/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoaded({
  id,
  title,
  formattedLoanAmount,
  perSecondInterestRate,
  metadata: { mediaMimeType, mediaUrl, name },
}: LoanCardLoadedProps) {
  console.log({
    id,
    title,
    formattedLoanAmount,
    perSecondInterestRate,
    mediaMimeType,
    mediaUrl,
    name,
  });
  return (
    <Link href={`/loans/${id}`}>
      <a className={styles.link} aria-label={title} title={title}>
        <div className={styles.card}>
          <Media
            media={mediaUrl}
            mediaMimeType={mediaMimeType}
            autoPlay={false}
          />
          <span>{name}</span>
          <Attributes>
            <span>{formattedLoanAmount}</span>
            <span>
              {formattedAnnualRate(
                ethers.BigNumber.from(perSecondInterestRate),
              )}
              % interest
            </span>
          </Attributes>
        </div>
      </a>
    </Link>
  );
}

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoading() {
  return (
    <div className={styles.card}>
      <div className={styles['loading-media']} />
      <span>loading name</span>
      <Attributes>
        <span>loading attributes</span>
      </Attributes>
    </div>
  );
}
