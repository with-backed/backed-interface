import React from 'react';
import { render } from '@testing-library/react';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { LoanCard, ProfileLoanCard } from 'components/LoanCard';
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
    const error = console.error;
    beforeEach(() => {
      console.error = jest.fn();
      jest.clearAllMocks();
    });
    afterAll(() => {
      console.error = error;
    });

    it('renders a loading state when metadata has not resolved yet', () => {
      mockedUseTokenMetadata.mockReturnValue({
        isLoading: true,
        metadata: null,
      });
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

  describe('ProfileLoanCard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders a loading state when metadata has not resolved yet', () => {
      mockedUseTokenMetadata.mockReturnValue({
        isLoading: true,
        metadata: null,
      });
      const { getByText } = render(
        <ProfileLoanCard loan={loan} selectedAddress="0xwhatever" />,
      );
      getByText('loading name');
    });

    it('renders what it can when metadata cannot be fetched', () => {
      mockedUseTokenMetadata.mockReturnValue({
        isLoading: false,
        metadata: null,
      });
      const { getAllByText } = render(
        <ProfileLoanCard loan={loan} selectedAddress="0xwhatever" />,
      );
      const placeholders = getAllByText('--');
      // one for the name we couldn't fetch, one for the time remaining
      expect(placeholders).toHaveLength(2);
    });

    it('renders a ProfileLoanCard', () => {
      mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
      const { getByText } = render(
        <ProfileLoanCard loan={loan} selectedAddress="0xwhatever" />,
      );
      getByText(metadata.name);
      getByText('lender');
    });

    it('renders a ProfileLoanCard where the user is the borrower', () => {
      mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
      const { getByText } = render(
        <ProfileLoanCard loan={loan} selectedAddress={baseLoan.borrower} />,
      );
      getByText(metadata.name);
      getByText('borrower');
    });
  });
});
