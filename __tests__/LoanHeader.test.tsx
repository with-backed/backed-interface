import React from 'react';
import { render } from '@testing-library/react';
import { LoanHeader } from 'components/LoanHeader';
import { useTimestamp } from 'hooks/useTimestamp';
import {
  baseLoan,
  closedLoan,
  loanWithLenderAccruing,
  loanWithLenderPastDue,
  now,
} from 'lib/mockData';

jest.mock('components/Media', () => ({
  ...jest.requireActual('components/Media'),
  Media: () => <div></div>,
}));

jest.mock('hooks/useTimestamp', () => ({
  useTimestamp: jest.fn(),
}));

const mockedUseTimestamp = useTimestamp as jest.MockedFunction<
  typeof useTimestamp
>;

const collateralMedia = {
  mediaUrl: 'https:mediastuff',
  mediaMimeType: 'video',
};

describe('LoanHeader', () => {
  beforeEach(() => {
    mockedUseTimestamp.mockReturnValue(now);
  });

  it('renders a loading status for accruing loans when there is no timestamp', () => {
    mockedUseTimestamp.mockReturnValue(null);
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderAccruing}
      />,
    );
    getByText('Loading...');
  });

  it('renders a loading status for past due loans when there is no timestamp', () => {
    mockedUseTimestamp.mockReturnValue(null);
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderPastDue}
      />,
    );
    getByText('Loading...');
  });

  it('renders an awaiting lender status for loans that have not started', () => {
    const { getByText } = render(
      <LoanHeader collateralMedia={collateralMedia} loan={baseLoan} />,
    );
    getByText('Awaiting lender');
  });

  it('renders an accruing status for accruing loans', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderAccruing}
      />,
    );
    getByText('Accruing interest');
  });

  it('renders a past due status for past due loans', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderPastDue}
      />,
    );
    getByText('Past due');
  });

  it('renders a closed status for completed loans', () => {
    const { getByText } = render(
      <LoanHeader collateralMedia={collateralMedia} loan={closedLoan} />,
    );
    getByText('Closed');
  });

  it('renders the image fallback when we do not have the media info', () => {
    const { container } = render(
      <LoanHeader collateralMedia={null} loan={closedLoan} />,
    );
    const fallback = container.querySelector('.fallback');
    expect(fallback).not.toBeNull();
  });
});
