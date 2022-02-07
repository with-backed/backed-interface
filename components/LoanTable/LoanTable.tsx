import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import React, { useMemo } from 'react';
import { Loan } from 'types/generated/graphql/nftLoans';
import styles from './LoanTable.module.css';

type LoanTableProps = {
  loans: Loan[];
};

export function LoanTable({ loans }: LoanTableProps) {
  return (
    <table className={styles.table}>
      <Header />
      {loans.map((loan) => {
        return <Loan loan={loan} key={loan.id} />;
      })}
    </table>
  );
}

function Header() {
  return (
    <tr className={styles.header}>
      <th>Open to Lend</th>
      <th>Loan Amount</th>
      <th>Duration</th>
      <th>Rate/Return</th>
    </tr>
  );
}

type LoanProps = {
  loan: Loan;
};
function Loan({ loan }: LoanProps) {
  const tokenSpec = useMemo(
    () => ({
      contract: jsonRpcERC721Contract(loan.collateralContractAddress),
      tokenId: loan.collateralTokenId,
    }),
    [loan.collateralContractAddress, loan.collateralTokenId],
  );
  const { metadata, isLoading } = useTokenMetadata(tokenSpec);

  const loanAmount = useMemo(
    () => ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimal),
    [loan.loanAmount, loan.loanAssetDecimal],
  );

  const duration = useMemo(
    () => secondsBigNumToDays(ethers.BigNumber.from(loan.durationSeconds)),
    [loan.durationSeconds],
  );

  const rate = useMemo(
    () =>
      formattedAnnualRate(ethers.BigNumber.from(loan.perSecondInterestRate)),
    [loan.perSecondInterestRate],
  );
  return (
    <tr>
      <td className={styles['name-container']}>
        <NFTMedia
          collateralAddress={loan.collateralContractAddress}
          collateralTokenID={loan.collateralTokenId}
          forceImage
          small
        />
        <div className={styles['name-and-collection']}>
          <span>{isLoading ? '---' : metadata?.name}</span>
          <span>{loan.collateralName}</span>
        </div>
      </td>
      <td>
        {loanAmount} {loan.loanAssetSymbol}
      </td>
      <td>{duration} Days</td>
      <td>{rate} %</td>
    </tr>
  );
}
