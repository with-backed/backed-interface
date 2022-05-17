import React from 'react';
import { render } from '@testing-library/react';
import { ProfileActivity } from 'components/ProfileActivity';
import { events, subgraphLoan } from 'lib/mockData';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { ethers } from 'ethers';

jest.mock('hooks/useTokenMetadata', () => ({
  ...jest.requireActual('hooks/useTokenMetadata'),
  useTokenMetadata: jest.fn(),
}));

const mockedUseTokenMetadata = useTokenMetadata as jest.MockedFunction<
  typeof useTokenMetadata
>;

const eventsWithSubgraphLoan = events.map((e) => ({
  ...e,
  loan: subgraphLoan,
}));

describe('ProfileActivity', () => {
  beforeEach(() => {
    mockedUseTokenMetadata.mockReturnValue({
      isLoading: false,
      metadata: {
        name: 'Doctor Croctopus',
        description: 'a medical reptile',
        mediaUrl: 'taco://croctopus.h',
        mediaMimeType: 'audio',
        id: ethers.BigNumber.from('8'),
      },
    });
  });

  it('renders', () => {
    render(
      <ProfileActivity address="0xaddress" events={eventsWithSubgraphLoan} />,
    );
  });

  it('handles loading state of token metadata', () => {
    mockedUseTokenMetadata.mockReturnValue({ isLoading: true, metadata: null });
    const { getAllByText } = render(
      <ProfileActivity address="0xaddress" events={eventsWithSubgraphLoan} />,
    );

    const placeholders = getAllByText('---');
    expect(placeholders).toHaveLength(eventsWithSubgraphLoan.length);
  });
});
