import { getCommunityAccountInfo } from 'lib/community';
import { COMMUNITY_NFT_SUBGRAPH } from 'lib/constants';
import { clientFromUrl } from 'lib/urql';

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  clientFromUrl: jest.fn(() => ({
    query: jest.fn(() => ({
      toPromise: () => ({ data: null }),
    })),
  })),
}));

const mockedClientFromUrl = clientFromUrl as jest.MockedFunction<
  typeof clientFromUrl
>;

const address = '0xe89cb2053a04daf86abaa1f4bc6d50744e57d39e';

describe('getCommunityAccountInfo', () => {
  beforeEach(() => {
    mockedClientFromUrl.mockReturnValue({
      query: () => ({
        toPromise: async () => ({ data: null } as any),
      }),
    } as any);
  });

  it('returns the value of the query when available', async () => {
    mockedClientFromUrl.mockReturnValue({
      query: () => ({
        toPromise: async () =>
          ({
            data: {
              account: {
                id: address,
              },
            },
          } as any),
      }),
    } as any);
    const result = await getCommunityAccountInfo(
      address,
      COMMUNITY_NFT_SUBGRAPH,
    );
    expect(result).toEqual({ id: address });
  });

  it('returns null when the value is not available', async () => {
    const result = await getCommunityAccountInfo(
      address,
      COMMUNITY_NFT_SUBGRAPH,
    );
    expect(result).toEqual(null);
  });
});
