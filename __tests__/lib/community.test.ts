import { getAccessoryLookup, getCommunityAccountInfo } from 'lib/community';
import { COMMUNITY_NFT_SUBGRAPH } from 'lib/constants';
import { clientFromUrl } from 'lib/urql';
import { Accessory } from 'types/generated/graphql/communitysubgraph';

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

describe('community NFT accessors', () => {
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

  describe('getAccessoryLookup', () => {
    const accessory1: Accessory = {
      id: '1',
      name: 'The First Accessory',
      contractAddress: '0xcontract1',
    };
    const accessory2: Accessory = {
      id: '2',
      name: 'The Second Accessory',
      contractAddress: '0xcontract2',
    };
    beforeEach(() => {
      mockedClientFromUrl.mockReturnValue({
        query: () => ({
          toPromise: async () => ({ data: null } as any),
        }),
      } as any);
    });

    it('constructs a lookup table when data is available', async () => {
      // since we loop to make tests below it's good to make sure we actually fire the expected number of asserts
      expect.assertions(6);
      mockedClientFromUrl.mockReturnValue({
        query: () => ({
          toPromise: async () =>
            ({
              data: {
                accessories: [accessory1, accessory2],
              },
            } as any),
        }),
      } as any);
      const result = await getAccessoryLookup(COMMUNITY_NFT_SUBGRAPH);
      [accessory1, accessory2].forEach((acc) => {
        expect(result[acc.id]).toEqual(acc);
        expect(result[acc.name]).toEqual(acc);
        expect(result[acc.contractAddress]).toEqual(acc);
      });
    });

    it('returns empty obj when the value is not available', async () => {
      const result = await getAccessoryLookup(COMMUNITY_NFT_SUBGRAPH);
      expect(result).toEqual({});
    });
  });
});
