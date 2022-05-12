import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/reservoir';
import fetchMock from 'jest-fetch-mock';

describe('Reservoir API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('makes only one call to collection/v2 when NFT is not ArtBlocks', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        floor: null,
        items: null,
        owners: null,
        volume: null,
      }),
    );
    await collectionStatsEthMainnet(
      '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966',
      '147',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('makes one call to tokens/v4 and one call to collection/v2 when NFT is ArtBlocks', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        floor: null,
        items: null,
        owners: null,
        volume: null,
      }),
    ).once;
    fetchMock.mockResponse(
      JSON.stringify({
        tokens: [
          {
            collection: {
              id: '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270:74000000:74999999',
            },
          },
        ],
      }),
    ).once;

    await collectionStatsEthMainnet(
      '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270',
      '147',
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
