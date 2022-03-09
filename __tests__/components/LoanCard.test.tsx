import React from 'react';
import { getByText, render } from '@testing-library/react';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { LoanCard } from 'components/LoanCard';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { ethers } from 'ethers';
import { baseLoan } from 'lib/mockData';

jest.mock('hooks/useTokenMetadata', () => ({
  useTokenMetadata: jest.fn(),
}));

const mockedUseTokenMetadata = useTokenMetadata as jest.Mock;

const loan = baseLoan;

const metadata: GetNFTInfoResponse = {
  name: 'Monarch #7',
  description: '',
  id: ethers.BigNumber.from('7'),
  mediaMimeType: 'video/mp4',
  mediaUrl:
    'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
};

describe('LoanCard', () => {
  const error = console.error;
  beforeEach(() => {
    console.error = jest.fn();
    jest.clearAllMocks();
  });
  afterAll(() => {
    console.error = error;
  });

  it('renders a loading state when metadata has not resolved yet', () => {
    mockedUseTokenMetadata.mockReturnValue({ isLoading: true, metadata: null });
    const { getByText } = render(<LoanCard loan={loan} />);
    getByText('loading name');
  });

  it('renders what it can when metadata cannot be fetched', () => {
    mockedUseTokenMetadata.mockReturnValue({
      isLoading: false,
      metadata: null,
    });
    const { getByText } = render(<LoanCard loan={loan} />);
    getByText('--');
    expect(console.error).toHaveBeenCalled();
  });

  it('renders a LoanCard', () => {
    mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
    const { getByText } = render(<LoanCard loan={loan} />);
    getByText(metadata.name);
  });
});
