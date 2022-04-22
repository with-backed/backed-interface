import { Button } from 'components/Button';
import { LoanCard } from 'components/LoanCard';
import { LoanTable } from 'components/LoanTable';
import React from 'react';
import { Loan } from 'types/Loan';
import styles from './HomePageLoans.module.css';

type HomePageLoansProps = {
  loans: Loan[];
  view: 'cards' | 'list';
};

export function HomePageLoans({ loans, view }: HomePageLoansProps) {
  if (view === 'cards') {
    return (
      <>
        {loans.map((l) => (
          <LoanCard key={l.id.toString()} loan={l} display="compact" />
        ))}
      </>
    );
  }

  return <LoanTable loans={loans} />;
}

type LoadMoreButtonProps = {
  onClick: () => void;
  pageLimit: number;
  isReachingEnd?: boolean;
};
export function LoadMoreButton({
  isReachingEnd,
  onClick,
  pageLimit,
}: LoadMoreButtonProps) {
  return (
    <div className={styles['button-container']}>
      {isReachingEnd ? (
        <p>That&apos;s all, folks!</p>
      ) : (
        <Button onClick={onClick}>Load {pageLimit} More</Button>
      )}
    </div>
  );
}
