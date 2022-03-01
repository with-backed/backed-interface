import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
import { nftBackedLoansClient } from 'lib/urql';

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClient: {
    query: jest.fn(() => ({
      toPromise: () => ({ data: null }),
    })),
  },
}));

const mockedQuery = nftBackedLoansClient.query as jest.MockedFunction<
  typeof nftBackedLoansClient.query
>;

const loanId = '65';

describe('loanById', () => {
  beforeEach(() => {
    mockedQuery.mockReturnValue({
      toPromise: async () => ({ data: null } as any),
    } as any);
  });

  it('returns the value of the query when available', async () => {
    mockedQuery.mockReturnValue({
      toPromise: async () => {
        return {
          data: {
            loan: 'thing',
          },
        };
      },
    } as any);
    const result = await subgraphLoanById(loanId);
    expect(result).toEqual('thing');
  });

  it('returns null when the value is not available', async () => {
    const result = await subgraphLoanById(loanId);
    expect(result).toEqual(null);
  });
});
