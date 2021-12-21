import { CollateralInfo } from 'components/CollateralInfo';
import { Column } from 'components/Column';
import { TwoColumn } from 'components/layouts/TwoColumn';
import { RepaymentInfo } from 'components/RepaymentInfo';
import { TicketHistory } from 'components/ticketPage/TicketHistory';
import { Loan } from 'lib/types/Loan';
import React from 'react';
import styles from './LoanInfo.module.css';

type LoanInfoProps = {
  loan: Loan;
};

export function LoanInfo({ loan }: LoanInfoProps) {
  return (
    <div className={styles.wrapper}>
      <TwoColumn>
        <Column>
          <CollateralInfo loan={loan} />
          <TicketHistory loanInfo={loan} />
        </Column>
        <Column>
          <RepaymentInfo loan={loan} />
        </Column>
      </TwoColumn>
    </div>
  );
}
