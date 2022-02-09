import React from 'react';
import { render } from '@testing-library/react';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { LoanTable } from 'components/LoanTable';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { ethers } from 'ethers';
import { baseLoan } from 'lib/mockData';

jest.mock('hooks/useTokenMetadata', () => ({
  useTokenMetadata: jest.fn(),
}));

const mockedUseTokenMetadata = useTokenMetadata as jest.Mock;

const loans = [baseLoan, baseLoan];

const metadata: GetNFTInfoResponse = {
  name: 'Monarch #7',
  description: '',
  id: ethers.BigNumber.from('7'),
  mediaMimeType: 'video/mp4',
  mediaUrl:
    'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
};

describe('LoanTable', () => {
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
    const { getAllByText } = render(<LoanTable loans={loans} />);
    expect(getAllByText('---')).toHaveLength(2);
  });

  it('renders a LoanTable', () => {
    mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
    const { getAllByText } = render(<LoanTable loans={loans} />);
    expect(getAllByText(metadata.name)).toHaveLength(2);
  });
});
