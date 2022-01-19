import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import Link from 'next/link';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './LoanCard.module.css';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fallback } from 'components/Media/Fallback';
import { Loan } from 'types/Loan';

const Attributes: FunctionComponent = ({ children }) => {
  return <div className={styles.attributes}>{children}</div>;
};

type LoanCardProps = {
  loan: Loan;
  isBorrower?: boolean;
  isLender?: boolean;
};

export function LoanCard({
  loan: {
    id,
    loanAmount,
    loanAssetDecimals,
    loanAssetSymbol,
    perSecondInterestRate,
    collateralTokenURI,
    collateralTokenId,
  },
  isBorrower = false,
  isLender = false,
}: LoanCardProps) {
  const title = `View loan #${id}`;
  const formattedLoanAmount = useMemo(
    () =>
      `${ethers.utils.formatUnits(
        loanAmount,
        loanAssetDecimals,
      )} ${loanAssetSymbol}`,
    [loanAmount, loanAssetDecimals, loanAssetSymbol],
  );

  const tokenSpec = useMemo(
    () => ({
      tokenURI: collateralTokenURI,
      tokenID: ethers.BigNumber.from(collateralTokenId),
    }),
    [collateralTokenId, collateralTokenURI],
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
        id={id.toString()}
        title={title}
        formattedLoanAmount={formattedLoanAmount}
        perSecondInterestRate={perSecondInterestRate}
        metadata={maybeMetadata.metadata}
        isBorrower={isBorrower}
        isLender={isLender}
      />
    );
  }
}

type LoanCardLoadedProps = {
  id: string;
  title: string;
  formattedLoanAmount: string;
  perSecondInterestRate: ethers.BigNumber;
  metadata: GetNFTInfoResponse;
  isBorrower?: boolean;
  isLender?: boolean;
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
  isBorrower,
  isLender,
}: LoanCardLoadedProps) {
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
            <span>{formattedAnnualRate(perSecondInterestRate)}% interest</span>
          </Attributes>
          {(isBorrower || isLender) && (
            <Attributes>
              {isBorrower && (
                <span className={styles.borrower}>You are the borrower</span>
              )}
              {isLender && (
                <span className={styles.lender}>You are the lender</span>
              )}
            </Attributes>
          )}
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
    // This wrapping div simulates the presence of the <a> element in the
    // loaded one. Safari renders weirdly without it.
    <div>
      <div className={styles.card}>
        <Fallback />
        <span>loading name</span>
        <Attributes>
          <span>loading attributes</span>
        </Attributes>
      </div>
    </div>
  );
}
