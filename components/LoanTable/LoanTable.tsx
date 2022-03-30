import { DisplayCurrency } from 'components/DisplayCurrency';
import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Loan as LoanType } from 'types/Loan';
import styles from './LoanTable.module.css';

type LoanTableProps = {
  loans: LoanType[];
};

export function LoanTable({ loans }: LoanTableProps) {
  return (
    <table className={styles.table}>
      <Header />
      <tbody>
        {loans.map((loan) => {
          return <Loan loan={loan} key={loan.id.toString()} />;
        })}
      </tbody>
    </table>
  );
}

function Header() {
  return (
    <thead className={styles.header}>
      <tr>
        <th>Open to Lend</th>
        <th className={styles.right}>Loan Amount</th>
        <th className={styles.right}>Duration</th>
        <th className={styles.rate}>Rate/Return</th>
      </tr>
    </thead>
  );
}

type LoanProps = {
  loan: LoanType;
};
function Loan({ loan }: LoanProps) {
  const tokenSpec = useMemo(
    () => ({
      tokenURI: loan.collateralTokenURI,
      tokenID: loan.collateralTokenId,
      forceImage: true,
    }),
    [loan.collateralTokenURI, loan.collateralTokenId],
  );
  const nftInfo = useTokenMetadata(tokenSpec);
  const { metadata, isLoading } = nftInfo;

  const { formattedEstimatedPaybackAtMaturity, formattedTimeRemaining } =
    useLoanDetails(loan);

  const loanAmount = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals),
      ).toFixed(4),
    [loan.loanAmount, loan.loanAssetDecimals],
  );

  const duration = useMemo(
    () => secondsBigNumToDays(ethers.BigNumber.from(loan.durationSeconds)),
    [loan.durationSeconds],
  );

  const rate = useMemo(
    () =>
      parseFloat(
        formattedAnnualRate(ethers.BigNumber.from(loan.perAnumInterestRate)),
      ).toFixed(4),
    [loan.perAnumInterestRate],
  );
  return (
    <tr>
      <td>
        <Link href={`/loans/${loan.id.toString()}`}>
          <a className={styles['name-container']}>
            <NFTMedia nftInfo={nftInfo} small />
            <div className={styles['field-and-subfield']}>
              <span>{isLoading ? '---' : metadata?.name}</span>
              <span>{loan.collateralName}</span>
            </div>
          </a>
        </Link>
      </td>
      <td className={styles.right}>
        <div className={styles['field-and-subfield']}>
          <span>
            {loanAmount} {loan.loanAssetSymbol}
          </span>
          <span>
            <DisplayCurrency
              amount={{
                nominal: loanAmount,
                symbol: loan.loanAssetSymbol,
                address: loan.loanAssetContractAddress,
              }}
              currency="usd"
            />
          </span>
        </div>
      </td>
      <td className={styles.right}>
        <div className={styles['field-and-subfield']}>
          <span>
            {duration} {duration === 1 ? 'Day' : 'Days'}
          </span>
          <span>{formattedTimeRemaining}</span>
        </div>
      </td>
      <td className={styles.rate}>
        <div className={styles['field-and-subfield']}>
          <span>{rate} %</span>
          <span>{formattedEstimatedPaybackAtMaturity}</span>
        </div>
      </td>
    </tr>
  );
}
