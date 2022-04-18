import { ethers } from 'ethers';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { subgraphLoan } from 'lib/mockData';

describe('parseSubgraphLoan', () => {
  beforeAll(() => {
    Date.now = jest.fn(() => 1649170976115);
  });
  it('parses values correctly', () => {
    const result = parseSubgraphLoan(subgraphLoan);
    expect(result).toEqual({
      ...subgraphLoan,
      id: ethers.BigNumber.from(subgraphLoan.id),
      loanAmount: ethers.BigNumber.from(subgraphLoan.loanAmount),
      collateralTokenId: ethers.BigNumber.from(subgraphLoan.collateralTokenId),
      collateralContractAddress: ethers.utils.getAddress(
        subgraphLoan.collateralContractAddress,
      ),
      durationSeconds: ethers.BigNumber.from(subgraphLoan.durationSeconds),
      loanAssetSymbol: subgraphLoan.loanAssetSymbol,
      loanAssetContractAddress: ethers.utils.getAddress(
        subgraphLoan.loanAssetContractAddress,
      ),
      loanAssetDecimals: subgraphLoan.loanAssetDecimal,
      accumulatedInterest: ethers.BigNumber.from(
        subgraphLoan.accumulatedInterest,
      ),
      borrower: ethers.utils.getAddress(subgraphLoan.borrowTicketHolder),
      lender: ethers.utils.getAddress(subgraphLoan.lendTicketHolder),
      perAnumInterestRate: ethers.BigNumber.from(
        subgraphLoan.perAnumInterestRate,
      ),
      lastAccumulatedTimestamp: ethers.BigNumber.from(
        subgraphLoan.lastAccumulatedTimestamp,
      ),
      interestOwed: ethers.BigNumber.from('0'),
    });
  });

  describe('when last accumulated timestamp is not 0', () => {
    it('correctly computes interest owed', () => {
      const result = parseSubgraphLoan({
        ...subgraphLoan,
        lastAccumulatedTimestamp: 1649037744,
      });

      // This assumes the current implementation is correct, and guards that it
      // doesn't change. In the future it will be worthwhile to have an
      // integration test that checks the node and graph remain in sync.
      expect(result.interestOwed).toEqual(
        ethers.BigNumber.from('0x05dcef97daecb980'),
      );
    });
  });
});
