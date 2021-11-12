import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import Link from 'next/link';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './LoanCard.module.css';
import { cid } from 'is-ipfs';
import { useTokenMetadata } from 'hooks/useTokenMetadata';

console.log(cid('QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/3'));

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
  return (
    <Link href={`/loans/${id}`}>
      <a className={styles.link} aria-label={title} title={title}>
        <div className={styles.card}>
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
