import React from 'react';
import { render } from '@testing-library/react';
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
  describe('LoanCard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders a loading state when metadata has not resolved yet', () => {
      mockedUseTokenMetadata.mockReturnValue({
        isLoading: true,
        metadata: null,
      });
      const { getByText } = render(
        <LoanCard loan={loan} selectedAddress="0xwhatever" />,
      );
      getByText('loading name');
    });

    it('renders what it can when metadata cannot be fetched', () => {
      mockedUseTokenMetadata.mockReturnValue({
        isLoading: false,
        metadata: null,
      });
      const { getByText } = render(
        <LoanCard loan={loan} selectedAddress="0xwhatever" />,
      );

      // the name we couldn't fetch
      getByText('--');
    });

    it('renders a LoanCard', () => {
      mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
      const { getByText } = render(
        <LoanCard loan={loan} selectedAddress="0xwhatever" />,
      );
      getByText(metadata.name);
      getByText('lender');
    });

    it('renders a LoanCard where the user is the borrower', () => {
      mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
      const { getByText } = render(
        <LoanCard loan={loan} selectedAddress={baseLoan.borrower} />,
      );
      getByText(metadata.name);
      getByText('borrower');
    });
  });
});
