import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoanTickets } from 'components/LoanTickets';
import { baseLoan, loanWithLenderAccruing } from 'lib/mockData';
import { addressToENS } from 'lib/account';

jest.mock('components/Media', () => ({
  ...jest.requireActual('components/Media'),
  Media: () => <div></div>,
}));

jest.mock('lib/account', () => ({
  ...jest.requireActual('lib/account'),
  addressToENS: jest.fn(),
}));

const mockAddressToENS = addressToENS as jest.MockedFunction<
  typeof addressToENS
>;

describe('LoanTickets', () => {
  beforeEach(() => {
    mockAddressToENS.mockResolvedValue(null);
  });
  it('renders tickets for a loan with no lender', async () => {
    const { getByText } = render(<LoanTickets loan={baseLoan} />);
    await screen.findByText(baseLoan.borrower);

    // borrower address
    getByText(baseLoan.borrower);

    getByText('No lender yet');
  });

  it('renders tickets for a loan with a lender', async () => {
    const { getByText } = render(<LoanTickets loan={loanWithLenderAccruing} />);
    await screen.findByText(loanWithLenderAccruing.borrower);
    await screen.findByText(loanWithLenderAccruing.lender as string);

    // borrower address
    getByText(loanWithLenderAccruing.borrower);

    getByText(loanWithLenderAccruing.lender as string);
  });
});
