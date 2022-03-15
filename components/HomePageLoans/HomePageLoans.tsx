import { ProfileLoanCard } from 'components/LoanCard';
import { LoanTable } from 'components/LoanTable';
import React from 'react';
import { Loan } from 'types/Loan';

type HomePageLoansProps = {
  loans: Loan[];
  view: 'cards' | 'list';
};

export function HomePageLoans({ loans, view }: HomePageLoansProps) {
  if (view === 'cards') {
    return (
      <>
        {loans.map((l) => (
          <ProfileLoanCard key={l.id.toString()} loan={l} display="compact" />
        ))}
      </>
    );
  }

  return <LoanTable loans={loans} />;
}
