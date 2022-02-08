import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { LoanCard } from 'components/LoanCard';
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
      <TwelveColumn>
        {loans.map((l) => (
          <LoanCard key={l.id.toString()} loan={l} />
        ))}
      </TwelveColumn>
    );
  }

  return <LoanTable loans={loans} />;
}
