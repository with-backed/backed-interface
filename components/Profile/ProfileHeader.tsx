import {
  getActiveLoanCount,
  getClosedLoanCount,
  getNextLoanDue,
  getAllInterestAmounts,
  getAllPrincipalAmounts,
} from 'lib/loans/profileHeaderMethods';
import { useMemo } from 'react';
import { Loan } from 'types/Loan';
import { BorrowerLenderBubble } from './BorrowerLenderBubble';
import { NextLoanCountdown } from './NextLoanCountdown';
import styles from './profile.module.css';

type ProfileHeaderProps = {
  address: string;
  loans: Loan[];
};

type HeaderInformation = {
  Label: ({ borrower }: { address?: string; borrower: boolean }) => JSX.Element;
  Data: ({ loans }: { loans: Loan[] }) => JSX.Element;
};

const headerInfo: HeaderInformation[] = [
  {
    Label: ({ borrower, address }) => (
      <BorrowerLenderBubble address={address || ''} borrower={borrower} />
    ),
    Data: ({ loans }): JSX.Element => (
      <div>
        {getActiveLoanCount(loans)} Active; {getClosedLoanCount(loans)} Closed
      </div>
    ),
  },
  {
    Label: () => <div>Next Loan Due</div>,
    Data: ({ loans }): JSX.Element => <NextLoanCountdown loans={loans} />,
  },
  {
    Label: ({ borrower }) => (
      <div>{borrower ? 'Total Owed Principal' : 'Oustanding Principal'}</div>
    ),
    Data: ({ loans }): JSX.Element => (
      <div className={styles.amountsWrapper}>
        {getAllPrincipalAmounts(loans).map((amount, i, arr) => (
          <div key={i} className={styles.amount}>
            {amount.nominal} {amount.symbol}
            {i !== arr.length - 1 && ';'}
          </div>
        ))}
      </div>
    ),
  },
  {
    Label: ({ borrower }) => (
      <div>{borrower ? 'Total Owed Interest' : 'Total Accrued Interest'}</div>
    ),
    Data: ({ loans }): JSX.Element => (
      <div className={styles.amountsWrapper}>
        {getAllInterestAmounts(loans).map((amount, i, arr) => (
          <div key={i} className={styles.amount}>
            {' '}
            {amount.nominal} {amount.symbol}
            {i !== arr.length - 1 && ';'}
          </div>
        ))}
      </div>
    ),
  },
];

export function ProfileHeader({ address, loans }: ProfileHeaderProps) {
  const loansAsBorrower = useMemo(
    () => loans.filter((l) => l.borrower === address),
    [loans, address],
  );
  const loansAsLender = useMemo(
    () => loans.filter((l) => l.lender === address),
    [loans, address],
  );

  return (
    <div className={styles.profileHeaderWrapper}>
      {[loansAsBorrower, loansAsLender].map((loans, index) => (
        <div className={styles.profileHeaderRows} key={index}>
          {headerInfo.map(({ Label, Data }, inner) => (
            <div className={styles.headerRow} key={inner}>
              <div className={styles.leftSide}>
                <Label address={address} borrower={index === 0} />
              </div>
              <div className={styles.gutter} />
              <div className={styles.rightSide}>
                <Data loans={loans} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
