import { ethers } from 'ethers';
import { configs } from 'lib/config';
import { loanById } from 'lib/loans/loanById';
import { nodeLoanById } from 'lib/loans/node/nodeLoanById';
import { subgraphLoanById } from 'lib/loans/subgraph/subgraphLoanById';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { subgraphLoan } from 'lib/mockData';
import { Loan } from 'types/Loan';

jest.mock('lib/loans/subgraph/subgraphLoanById', () => ({
  ...jest.requireActual('lib/loans/subgraph/subgraphLoanById'),
  subgraphLoanById: jest.fn(),
}));
jest.mock('lib/loans/node/nodeLoanById', () => ({
  ...jest.requireActual('lib/loans/node/nodeLoanById'),
  nodeLoanById: jest.fn(),
}));

const mockedSubgraphLoanById = subgraphLoanById as jest.MockedFunction<
  typeof subgraphLoanById
>;
const mockedNodeLoanById = nodeLoanById as jest.MockedFunction<
  typeof nodeLoanById
>;
const loanId = '65';
const nftBackedLoansSubgraph = configs.rinkeby.nftBackedLoansSubgraph;
const provider = configs.rinkeby.jsonRpcProvider;
const parsedLoan: Loan = parseSubgraphLoan(subgraphLoan);

describe('loanById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSubgraphLoanById.mockResolvedValue(subgraphLoan);
    mockedNodeLoanById.mockResolvedValue(parsedLoan);
  });

  it('checks the subgraph for the loan, returning that data parsed if present', async () => {
    const loan = await loanById(
      loanId,
      nftBackedLoansSubgraph,
      provider,
      'rinkeby',
    );
    expect(mockedSubgraphLoanById).toHaveBeenCalledWith(
      loanId,
      nftBackedLoansSubgraph,
    );
    expect(loan?.id).toEqual(ethers.BigNumber.from(loanId));
    expect(mockedNodeLoanById).not.toHaveBeenCalled();
  });

  it('falls back to the node when there is no subgraph data', async () => {
    mockedSubgraphLoanById.mockResolvedValue(null);
    const loan = await loanById(
      loanId,
      nftBackedLoansSubgraph,
      provider,
      'rinkeby',
    );
    expect(mockedSubgraphLoanById).toHaveBeenCalledWith(
      loanId,
      nftBackedLoansSubgraph,
    );
    expect(loan?.id).toEqual(ethers.BigNumber.from(loanId));
    expect(mockedNodeLoanById).toHaveBeenCalledWith(
      loanId,
      provider,
      'rinkeby',
    );
  });

  it('returns null when we get an invalid value from the node', async () => {
    mockedSubgraphLoanById.mockResolvedValue(null);
    mockedNodeLoanById.mockResolvedValue({
      ...parsedLoan,
      loanAssetContractAddress: '0',
    });
    const loan = await loanById(
      loanId,
      nftBackedLoansSubgraph,
      provider,
      'rinkeby',
    );
    expect(loan).toBeNull();
  });

  it('returns null when an error occurs contacting the node', async () => {
    mockedSubgraphLoanById.mockResolvedValue(null);
    mockedNodeLoanById.mockImplementation(() => {
      throw new Error('fail');
    });
    const loan = await loanById(
      loanId,
      nftBackedLoansSubgraph,
      provider,
      'rinkeby',
    );
    expect(loan).toBeNull();
  });
});
