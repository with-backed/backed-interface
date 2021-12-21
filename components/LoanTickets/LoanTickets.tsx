import { Fieldset } from 'components/Fieldset';
import { PawnLoanArt, PawnTicketArt } from 'components/ticketPage/PawnArt';
import { Loan } from 'lib/types/Loan';
import React from 'react';
import styles from './LoanTickets.module.css';

type LoanTicketsProps = {
  loan: Loan;
};

export function LoanTickets({ loan }: LoanTicketsProps) {
  return (
    <Fieldset legend="🖇️ Loan tickets">
      <div className={styles.wrapper}>
        <PawnTicketArt tokenId={loan.id} />
        <PawnLoanArt tokenId={loan.id} />
      </div>
    </Fieldset>
  );
}
