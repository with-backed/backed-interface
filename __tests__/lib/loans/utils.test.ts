import { ethers } from 'ethers';
import {
  Loan as SubgraphLoan,
  LoanStatus,
} from 'types/generated/graphql/nftLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';

const subgraphLoan: SubgraphLoan = {
  id: '1',
  loanAssetContractAddress: '0x6916577695d0774171de3ed95d03a3239139eddb',
  collateralContractAddress: '0xeae95cbe33d6be0f3839dd5bb920ec3e319819cf',
  collateralTokenId: '21',
  perAnumInterestRate: '100',
  accumulatedInterest: '0',
  lastAccumulatedTimestamp: '0',
  durationSeconds: '31536000',
  loanAmount: '1000000000000000000000',
  status: LoanStatus.Active,
  closed: false,
  loanAssetDecimal: 18,
  loanAssetSymbol: 'DAI',
  lendTicketHolder: '0x80aea4eeed34806a038841656c2ede5f0dc45e95',
  borrowTicketHolder: '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4',
  endDateTimestamp: 1680573744,
  collateralTokenURI: 'gopher://gopher.pawnshop.internet',
  collateralName: 'valenftines',
  createdAtTimestamp: 1649037684,
  lastUpdatedAtTimestamp: 1649037744,
  numEvents: 2,
  __typename: 'Loan',
};

describe('parseSubgraphLoan', () => {
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
      // TODO: test this
      expect(false).toBeTruthy();
    });
  });
});
