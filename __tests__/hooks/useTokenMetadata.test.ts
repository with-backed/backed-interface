import { renderHook, act } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { CollateralSpec } from 'hooks/useTokenMetadata/useTokenMetadata';
import { getNFTInfoFromTokenInfo } from 'lib/getNFTInfo';

// JSDom doesn't have TextEncoder. We're not actually running getNFTInfo
// code, so just doing a simple mock.
jest.mock('is-ipfs', () => ({}));

jest.mock('lib/getNFTInfo', () => ({
  ...jest.requireActual('lib/getNFTInfo'),
  getNFTInfo: jest.fn(),
  getNFTInfoFromTokenInfo: jest.fn(),
}));

const mockedGetNFTInfoFromTokenInfo = getNFTInfoFromTokenInfo as jest.Mock;

const collateralSpec: CollateralSpec = {
  collateralContractAddress: '0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949',
  collateralTokenId: ethers.BigNumber.from(1),
};

describe('useTokenMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetNFTInfoFromTokenInfo.mockResolvedValueOnce('fromTokenURI');
  });

  it('starts in a loading state, then returns a value based on token URI', async () => {
    expect.assertions(3);
    const { result } = renderHook(() => useTokenMetadata(collateralSpec));
    expect(result.current).toEqual(
      expect.objectContaining({ isLoading: true, metadata: null }),
    );
    await act(async () => {});
    expect(result.current).toEqual(
      expect.objectContaining({ isLoading: false, metadata: 'fromTokenURI' }),
    );
    expect(mockedGetNFTInfoFromTokenInfo).toHaveBeenCalledTimes(1);
  });

  it('returns cached value when called with the same params', async () => {
    expect.assertions(2);
    const { result } = renderHook(() => useTokenMetadata(collateralSpec));
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        metadata: 'fromTokenURI',
      }),
    );
    expect(mockedGetNFTInfoFromTokenInfo).not.toHaveBeenCalled();
  });
});
