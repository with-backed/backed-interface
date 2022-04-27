import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { Fallback } from 'components/Media/Fallback';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { DisplayAddress } from 'components/DisplayAddress';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { contractDirectory } from 'lib/contracts';
import { Loan } from 'types/Loan';
import React from 'react';
import styles from './LoanTickets.module.css';
import Link from 'next/link';
import { Asset } from 'nft-react';
import { ethers } from 'ethers';

type LoanTicketsProps = {
  loan: Loan;
};

type BorrowerColumnProps = {
  loanId: ethers.BigNumber;
  borrower: string;
  formattedTotalPayback: string;
};

function BorrowerColumn({
  loanId,
  borrower,
  formattedTotalPayback,
}: BorrowerColumnProps) {
  return (
    <div className={styles.column}>
      <Asset
        address={contractDirectory.borrowTicket}
        tokenId={loanId.toString()}
      />
      <OpenSeaAddressLink
        assetId={loanId.toString()}
        contractAddress={contractDirectory.borrowTicket}>
        View on OpenSea
      </OpenSeaAddressLink>
      <DescriptionList>
        <dt>Borrower</dt>
        <dd title={borrower}>
          <Link href={`/profile/${borrower}`}>
            <a>
              <DisplayAddress address={borrower} />
            </a>
          </Link>
        </dd>
        <dt>Current cost to repay</dt>
        <dd>{formattedTotalPayback}</dd>
      </DescriptionList>
    </div>
  );
}

type LenderColumnProps = {
  loanId: ethers.BigNumber;
  lender: string | null;
  formattedInterestAccrued: string;
};

function LenderColumn({
  loanId,
  lender,
  formattedInterestAccrued,
}: LenderColumnProps) {
  if (!lender) {
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
      <Asset
        address={contractDirectory.lendTicket}
        tokenId={loanId.toString()}
      />
      <OpenSeaAddressLink
        assetId={loanId.toString()}
        contractAddress={contractDirectory.lendTicket}>
        View on OpenSea
      </OpenSeaAddressLink>
      <DescriptionList>
        <dt>Lender</dt>
        <dd>
          <Link href={`/profile/${lender}`}>
            <a>
              <DisplayAddress address={lender} />
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
  const { formattedTotalPayback, formattedInterestAccrued } =
    useLoanDetails(loan);
  return (
    <Fieldset legend="🖇️ Loan tickets">
      <div className={styles.wrapper}>
        <BorrowerColumn
          loanId={loan.id}
          borrower={loan.borrower}
          formattedTotalPayback={formattedTotalPayback}
        />
        <LenderColumn
          loanId={loan.id}
          lender={loan.lender}
          formattedInterestAccrued={formattedInterestAccrued}
        />
      </div>
    </Fieldset>
  );
}
