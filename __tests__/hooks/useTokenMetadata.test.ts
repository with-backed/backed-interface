import { renderHook, act } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { TokenURIAndID } from 'hooks/useTokenMetadata/useTokenMetadata';
import {
  getNFTInfo,
  GetNFTInfoArgs,
  getNFTInfoFromTokenInfo,
} from 'lib/getNFTInfo';

// JSDom doesn't have TextEncoder. We're not actually running getNFTInfo
// code, so just doing a simple mock.
jest.mock('is-ipfs', () => ({}));

jest.mock('lib/getNFTInfo', () => ({
  ...jest.requireActual('lib/getNFTInfo'),
  getNFTInfo: jest.fn(),
  getNFTInfoFromTokenInfo: jest.fn(),
}));

const mockedGetNFTInfo = getNFTInfo as jest.Mock;
const mockedGetNFTInfoFromTokenInfo = getNFTInfoFromTokenInfo as jest.Mock;

const tokenURIAndID: TokenURIAndID = {
  tokenURI: 'https://this-is-a-mock-uri',
  tokenID: ethers.BigNumber.from(1),
};

const getNFTInfoArgs: GetNFTInfoArgs = {
  tokenId: ethers.BigNumber.from(1),
  // Not actually using this due to mock
  contract: {} as any,
};

describe('useTokenMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in a loading state, then returns a value based on token URI', async () => {
    mockedGetNFTInfoFromTokenInfo.mockResolvedValueOnce('fromTokenURI');
    expect.assertions(4);
    const { result } = renderHook(() => useTokenMetadata(tokenURIAndID));
    expect(result.current).toEqual(
      expect.objectContaining({ isLoading: true, metadata: null }),
    );
    await act(async () => {});
    expect(result.current).toEqual(
      expect.objectContaining({ isLoading: false, metadata: 'fromTokenURI' }),
    );
    expect(mockedGetNFTInfoFromTokenInfo).toHaveBeenCalledTimes(1);
    expect(mockedGetNFTInfo).not.toHaveBeenCalled();
  });

  it('starts in a loading state, then returns a value based on contract and ID', async () => {
    mockedGetNFTInfo.mockResolvedValueOnce('fromContractAndID');
    expect.assertions(4);
    const { result } = renderHook(() => useTokenMetadata(getNFTInfoArgs));
    expect(result.current).toEqual(
      expect.objectContaining({ isLoading: true, metadata: null }),
    );
    await act(async () => {});
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        metadata: 'fromContractAndID',
      }),
    );
    expect(mockedGetNFTInfoFromTokenInfo).not.toHaveBeenCalled();
    expect(mockedGetNFTInfo).toHaveBeenCalledTimes(1);
  });

  it('returns cached value when called with the same params', async () => {
    expect.assertions(3);
    const { result } = renderHook(() => useTokenMetadata(getNFTInfoArgs));
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        metadata: 'fromContractAndID',
      }),
    );
    expect(mockedGetNFTInfoFromTokenInfo).not.toHaveBeenCalled();
    expect(mockedGetNFTInfo).not.toHaveBeenCalled();
  });
});
