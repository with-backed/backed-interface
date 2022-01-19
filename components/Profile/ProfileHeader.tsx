import {
  getActiveLoanCount,
  getClosedLoanCount,
  getNextLoanDue,
  getTotalOwedInterest,
  getTotalOwedPrincipal,
} from 'lib/loans/profileHeaderMethods';
import { useMemo } from 'react';
import { Loan } from 'types/Loan';
import { NextLoanCountdown } from './NextLoanCountdown';
import styles from './profileHeader.module.css';

type ProfileHeaderProps = {
  address: string;
  loans: Loan[];
};

type HeaderInformation = {
  Label: ({ borrower }: { borrower: boolean }) => JSX.Element;
  Render: ({ loans }: { loans: Loan[] }) => JSX.Element;
};

const headerInfo: HeaderInformation[] = [
  {
    Label: ({ borrower }) => (
      <div
        className={`${styles.bubble} ${
          borrower ? styles.borrowerBubble : styles.lenderBubble
        }`}>{`You are the ${borrower ? 'borrower' : 'lender'}`}</div>
    ),
    Render: ({ loans }): JSX.Element => (
      <div>
        {getActiveLoanCount(loans)} Active; {getClosedLoanCount(loans)} Closed
      </div>
    ),
  },
  {
    Label: () => <div>Next Loan Due</div>,
    Render: ({ loans }): JSX.Element => <NextLoanCountdown loans={loans} />,
  },
  {
    Label: ({ borrower }) => (
      <div>{borrower ? 'Total Owed Principal' : 'Oustanding Principal'}</div>
    ),
    Render: ({ loans }): JSX.Element => (
      <div>
        {getActiveLoanCount(loans)} Active; {getClosedLoanCount(loans)} Closed
      </div>
    ),
  },
  {
    Label: ({ borrower }) => (
      <div>{borrower ? 'Total Owed Interest' : 'Total Accrued Interest'}</div>
    ),
    Render: ({ loans }): JSX.Element => (
      <div className={styles.amountsWrapper}>
        {getTotalOwedInterest(loans).map((amount, i) => (
          <div key={i} className={styles.amount}>
            {' '}
            {amount.nominal} {amount.symbol};
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
          {headerInfo.map(({ Label, Render }, inner) => (
            <div className={styles.headerRow} key={inner}>
              <div className={styles.leftSide}>
                <Label borrower={index === 0} />
              </div>
              <div className={styles.gutter} />
              <div className={styles.rightSide}>
                <Render loans={loans} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// <div>Next Loan Due</div>
// <div>Total Owed Principal</div>
// <div>Total Owed Interest</div>
// <div>Total Owed</div>

/*
<div className={styles.data}>
                    <div>{getActiveLoanCount(loansAsBorrower)} Active; {getClosedLoanCount(loansAsBorrower)} Closed</div>
                    <div>{getNextLoanDue(loansAsBorrower)}</div>
                    <div>{getTotalOwedPrincipal(loans).map((amount, i) => (
                        <span key={i}>{amount.nominal} {amount.symbol}; </span>
                    ))}</div>
                    <div>{getTotalOwedInterest(loans).map((amount, i) => (
                        <span key={i}>{amount.nominal} {amount.symbol}; </span>
                    ))}</div>
                    <div>{getActiveLoanCount(loansAsBorrower)} Active; {getClosedLoanCount(loansAsBorrower)} Closed</div>
                </div>
*/
