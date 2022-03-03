import React from 'react';
import { render } from '@testing-library/react';
import { LoanTickets } from 'components/LoanTickets';
import { baseLoan, loanWithLenderAccruing } from 'lib/mockData';

jest.mock('components/Media', () => ({
  ...jest.requireActual('components/Media'),
  Media: () => <div></div>,
}));

describe('LoanTickets', () => {
  it('renders tickets for a loan with no lender', () => {
    const { getByText } = render(<LoanTickets loan={baseLoan} />);
    // borrower address
    getByText(baseLoan.borrower);

    getByText('No lender yet');
  });

  it('renders tickets for a loan with a lender', () => {
    const { getByText } = render(<LoanTickets loan={loanWithLenderAccruing} />);
    // borrower address
    getByText(loanWithLenderAccruing.borrower);

    getByText(loanWithLenderAccruing.lender as string);
  });
});
