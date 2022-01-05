import { DescriptionList } from 'components/DescriptionList';
import { EtherscanAddressLink } from 'components/EtherscanLink';
import { Fieldset } from 'components/Fieldset';
import { Fallback } from 'components/Media/Fallback';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { PawnLoanArt, PawnTicketArt } from 'components/ticketPage/PawnArt';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { Loan } from 'lib/types/Loan';
import React from 'react';
import styles from './LoanTickets.module.css';

const BORROW_CONTRACT = jsonRpcERC721Contract(
  process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
);

const LEND_CONTRACT = jsonRpcERC721Contract(
  process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
);

type LoanTicketsProps = {
  loan: Loan;
};

type BorrowerColumnProps = LoanTicketsProps;

function BorrowerColumn({ loan }: BorrowerColumnProps) {
  const { formattedTotalPayback } = useLoanDetails(loan);
  return (
    <div className={styles.column}>
      <PawnTicketArt tokenId={loan.id} />
      <DescriptionList>
        <dt>Borrower</dt>
        <dd title={loan.borrower}>
          {loan.borrower.slice(0, 9)}...
          <br />
          <OpenSeaAddressLink
            assetId={loan.id.toNumber()}
            contractAddress={BORROW_CONTRACT.address}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>
        <dt>Current cost to repay</dt>
        <dd>{formattedTotalPayback}</dd>
      </DescriptionList>
    </div>
  );
}

type LenderColumnProps = LoanTicketsProps;

function LenderColumn({ loan }: LenderColumnProps) {
  const { formattedInterestAccrued } = useLoanDetails(loan);

  if (!loan.lender) {
    return (
      <div className={styles.column}>
        <Fallback />
        <DescriptionList>
          <dt>Lender</dt>
          <dd>No lender yet</dd>
          <dt>Interest Accrued to Date</dt>
          <dd>{formattedInterestAccrued}</dd>
        </DescriptionList>
      </div>
    );
  }

  return (
    <div className={styles.column}>
      <PawnLoanArt tokenId={loan.id} />
      <DescriptionList>
        <dt>Lender</dt>
        <dd>
          {loan.lender.slice(0, 9)}...
          <br />
          <OpenSeaAddressLink
            assetId={loan.id.toNumber()}
            contractAddress={LEND_CONTRACT.address}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>
        <dt>Interest Accrued to Date</dt>
        <dd>{formattedInterestAccrued}</dd>
      </DescriptionList>
    </div>
  );
}

export function LoanTickets({ loan }: LoanTicketsProps) {
  return (
    <Fieldset legend="🖇️ Loan tickets">
      <div className={styles.wrapper}>
        <BorrowerColumn loan={loan} />
        <LenderColumn loan={loan} />
      </div>
    </Fieldset>
  );
}
