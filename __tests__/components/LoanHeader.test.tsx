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
import noop from 'lodash/noop';

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
        refresh={noop}
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
        refresh={noop}
      />,
    );
    getByText('Loading...');
  });

  it('renders an awaiting lender status for loans that have not started', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={baseLoan}
        refresh={noop}
      />,
    );
    getByText('Awaiting lender');
  });

  it('renders an accruing status for accruing loans', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderAccruing}
        refresh={noop}
      />,
    );
    getByText('Accruing interest');
  });

  it('renders a past due status for past due loans', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={loanWithLenderPastDue}
        refresh={noop}
      />,
    );
    getByText('Past due');
  });

  it('renders a closed status for completed loans', () => {
    const { getByText } = render(
      <LoanHeader
        collateralMedia={collateralMedia}
        loan={closedLoan}
        refresh={noop}
      />,
    );
    getByText('Closed');
  });

  it('renders the image fallback when we do not have the media info', () => {
    const { container } = render(
      <LoanHeader collateralMedia={null} loan={closedLoan} refresh={noop} />,
    );
    const fallback = container.querySelector('.fallback-animated');
    expect(fallback).not.toBeNull();
  });
});
