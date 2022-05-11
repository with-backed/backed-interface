import { configs } from 'lib/config';
import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
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

const loanId = '65';

describe('loanById', () => {
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
              loan: 'thing',
            },
          } as any),
      }),
    } as any);
    const result = await subgraphLoanById(
      loanId,
      configs.rinkeby.nftBackedLoansSubgraph,
    );
    expect(result).toEqual('thing');
  });

  it('returns null when the value is not available', async () => {
    const result = await subgraphLoanById(
      loanId,
      configs.rinkeby.nftBackedLoansSubgraph,
    );
    expect(result).toEqual(null);
  });
});
