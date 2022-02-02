import { renderHook, act } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { useNFTs } from 'hooks/useNFTs';
import { useQuery } from 'urql';

jest.mock('urql', () => ({
  ...jest.requireActual('urql'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

const data = {
  account: {
    __typename: 'Account',
    id: '0x31fd8d16641d06e0eada78b475ae367163704774',
    tokens: [
      {
        __typename: 'Token',
        approvals: [
          {
            __typename: 'Approval',
            approved: {
              __typename: 'Account',
              id: '0x0b871556a94b2e7bc258dc28dd734ede42050e24',
            },
            id: '9661366-26',
          },
        ],
        id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966-0x7',
        identifier: '7',
        registry: {
          __typename: 'TokenRegistry',
          name: 'Monarchs',
          symbol: 'MNR',
        },
        uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/7',
      },
      {
        __typename: 'Token',
        approvals: [],
        id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966-0x8',
        identifier: '8',
        registry: {
          __typename: 'TokenRegistry',
          name: 'Monarchs',
          symbol: 'MNR',
        },
        uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/8',
      },
    ],
  },
};

describe('useTokenMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts off in a fetching state', () => {
    expect.assertions(1);
    mockUseQuery.mockReturnValue([{ data: null, fetching: true }] as any);
    const { result } = renderHook(() => useNFTs('0xaddress'));
    expect(result.current).toEqual(
      expect.objectContaining({
        fetching: true,
        nfts: [],
      }),
    );
  });

  it('processes and returns NFTs when the request succeeds', () => {
    expect.assertions(3);
    mockUseQuery.mockReturnValue([{ data, fetching: false }] as any);
    const { result } = renderHook(() => useNFTs('0xaddress'));
    expect(result.current.fetching).toBe(false);
    expect(result.current.nfts).toHaveLength(2);
    expect(
      result.current.nfts[0].identifier.eq(ethers.BigNumber.from('7')),
    ).toBeTruthy();
  });
});
