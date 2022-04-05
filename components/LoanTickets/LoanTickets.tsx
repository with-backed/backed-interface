import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { Fallback } from 'components/Media/Fallback';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { PawnLoanArt, PawnTicketArt } from 'components/PawnArt';
import { DisplayAddress } from 'components/DisplayAddress';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { Loan } from 'types/Loan';
import React from 'react';
import styles from './LoanTickets.module.css';
import Link from 'next/link';

type LoanTicketsProps = {
  loan: Loan;
};

type BorrowerColumnProps = LoanTicketsProps;

function BorrowerColumn({ loan }: BorrowerColumnProps) {
  const { formattedTotalPayback } = useLoanDetails(loan);
  const BORROW_CONTRACT = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
  );

  return (
    <div className={styles.column}>
      <PawnTicketArt tokenId={loan.id} />
      <OpenSeaAddressLink
        assetId={loan.id.toString()}
        contractAddress={BORROW_CONTRACT.address}>
        View on OpenSea
      </OpenSeaAddressLink>
      <DescriptionList>
        <dt>Borrower</dt>
        <dd title={loan.borrower}>
          <Link href={`/profile/${loan.borrower}`}>
            <a>
              <DisplayAddress address={loan.borrower} />
            </a>
          </Link>
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
  const LEND_CONTRACT = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
  );

  if (!loan.lender) {
    return (
      <div className={styles.column}>
        <Fallback animated={false} />
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
      <OpenSeaAddressLink
        assetId={loan.id.toString()}
        contractAddress={LEND_CONTRACT.address}>
        View on OpenSea
      </OpenSeaAddressLink>
      <DescriptionList>
        <dt>Lender</dt>
        <dd>
          <Link href={`/profile/${loan.lender}`}>
            <a>
              <DisplayAddress address={loan.lender} />
            </a>
          </Link>
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
