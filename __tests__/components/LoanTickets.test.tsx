import React from 'react';
import { render } from '@testing-library/react';
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
  it('renders tickets for a loan with no lender', () => {
    const { findByText } = render(<LoanTickets loan={baseLoan} />);

    // borrower address
    findByText(baseLoan.borrower);

    findByText('No lender yet');
  });

  it('renders tickets for a loan with a lender', async () => {
    const { findByText } = render(
      <LoanTickets loan={loanWithLenderAccruing} />,
    );

    // borrower address
    findByText(loanWithLenderAccruing.borrower);

    findByText(loanWithLenderAccruing.lender as string);
  });
});
