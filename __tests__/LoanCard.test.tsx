import React from 'react';
import { render } from '@testing-library/react';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { LoanCard } from 'components/LoanCard';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';

jest.mock('hooks/useTokenMetadata', () => ({
  useTokenMetadata: jest.fn(),
}));

const mockedUseTokenMetadata = useTokenMetadata as jest.Mock;

const loan: Loan = {
  id: ethers.BigNumber.from('1'),
  loanAssetSymbol: 'DAI',
  loanAssetDecimals: 18,
  loanAmount: ethers.BigNumber.from('200'),
  perSecondInterestRate: ethers.BigNumber.from('200'),
  collateralTokenId: ethers.BigNumber.from('3'),
  collateralTokenURI: 'gopher://gopher.pawnshop.internet',
  loanAssetContractAddress: '0xcontractAddress',
  collateralContractAddress: '0xcontractAddress',
  accumulatedInterest: ethers.BigNumber.from('0'),
  lastAccumulatedTimestamp: ethers.BigNumber.from('0'),
  durationSeconds: ethers.BigNumber.from('100000'),
  closed: false,
  lender: '0xlender',
  borrower: '0xborrower',
  interestOwed: ethers.BigNumber.from('0'),
  endDateTimestamp: 45000000,
};

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

  it('renders null when metadata cannot be fetched', () => {
    expect.assertions(2);
    mockedUseTokenMetadata.mockReturnValue({
      isLoading: false,
      metadata: null,
    });
    const { container } = render(<LoanCard loan={loan} />);
    expect(container.children).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('renders a LoanCard', () => {
    mockedUseTokenMetadata.mockReturnValue({ isLoading: false, metadata });
    const { getByText } = render(<LoanCard loan={loan} />);
    getByText(metadata.name);
  });
});
