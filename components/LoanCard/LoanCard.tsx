import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import Link from 'next/link';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './LoanCard.module.css';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';

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
  const metadata = useTokenMetadata(collateralTokenURI);

  if (!metadata) {
    // TODO: @cnasc loading/error states
    return null;
  }

  return (
    <Link href={`/loans/${id}`}>
      <a className={styles.link} aria-label={title} title={title}>
        <div className={styles.card}>
          <Media
            media={metadata.mediaUrl}
            mediaMimeType={metadata.mediaMimeType}
            autoPlay={false}
          />
          <span>{metadata.name}</span>
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
