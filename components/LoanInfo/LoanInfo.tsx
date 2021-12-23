import { CollateralInfo } from 'components/CollateralInfo';
import { Column } from 'components/Column';
import { TwoColumn } from 'components/layouts/TwoColumn';
import { RepaymentInfo } from 'components/RepaymentInfo';
import { TicketHistory } from 'components/ticketPage/TicketHistory';
import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';
import React, { useMemo } from 'react';
import styles from './LoanInfo.module.css';
import chunk from 'lodash/chunk';
import { LoanTickets } from 'components/LoanTickets';

type LoanInfoProps = {
  loan: Loan;
};

function addressStringToHSL(address: string) {
  // remove leading '0x' from hex string, split into nibbles
  const hash = ethers.utils.keccak256(address).slice(2).split('');
  const bytes = chunk(hash, 2).map((nibbles) => parseInt(nibbles.join(''), 16));

  const h = (bytes[0] + bytes[1]) % 360;
  const s = 80 + (bytes[2] % 20);
  const l = 80 + (bytes[3] % 10);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function LoanInfo({ loan }: LoanInfoProps) {
  const { collateralContractAddress, loanAssetContractAddress } = loan;
  const primary = useMemo(
    () => addressStringToHSL(collateralContractAddress),
    [collateralContractAddress],
  );
  const secondary = useMemo(
    () => addressStringToHSL(loanAssetContractAddress),
    [loanAssetContractAddress],
  );

  return (
    <div
      style={{
        background: `linear-gradient(-45deg, ${primary} 0%, ${secondary} 100%)`,
      }}
      className={styles.wrapper}>
      <div className={styles.mask} />
      <TwoColumn>
        <Column>
          <CollateralInfo loan={loan} />
          <TicketHistory loanInfo={loan} />
        </Column>
        <Column>
          <RepaymentInfo loan={loan} />
          <LoanTickets loan={loan} />
        </Column>
      </TwoColumn>
    </div>
  );
}
