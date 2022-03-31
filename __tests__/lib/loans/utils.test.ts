import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import {
  Loan as SubgraphLoan,
  LoanStatus,
} from 'types/generated/graphql/nftLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { SCALAR } from 'lib/constants';

describe('parseSubgraphLoan', () => {
  let accumulatedInterest = '186000000000000';
  let borrowTicketHolder = '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4';
  let closed = false;
  let collateralContractAddress = '0x325a0dd968cafaf2cc01232564c49ad0b1d71313';
  let collateralTokenId = '1';
  let durationSeconds = '864000';
  let createdAtTimestamp = 1439776108;
  let endDateTimestamp = 1639776108;
  let id = '1';
  let lastAccumulatedTimestamp = '0';
  const lastUpdatedAtTimestamp = 1644953457;
  let lendTicketHolder = '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4';
  let loanAmount = '1000000000000000000000';
  let loanAssetContractAddress = '0x6916577695d0774171de3ed95d03a3239139eddb';
  let loanAssetDecimal = 18;
  let loanAssetSymbol = 'DAI';
  let perAnumInterestRate = '15';
  const collateralTokenURI = 'gopher://gopher.pawnshop.internet';
  const collateralName = 'This is a name';
  const numEvents = 0;
  const status = LoanStatus.Active;
  let subgraphLoan: SubgraphLoan;

  function result(): Loan {
    return parseSubgraphLoan(subgraphLoan);
  }

  beforeAll(() => {
    subgraphLoan = Object.freeze({
      accumulatedInterest,
      borrowTicketHolder,
      closed,
      collateralContractAddress,
      collateralTokenId,
      durationSeconds,
      endDateTimestamp,
      id,
      lastAccumulatedTimestamp,
      lendTicketHolder,
      loanAmount,
      loanAssetContractAddress,
      loanAssetDecimal,
      loanAssetSymbol,
      perAnumInterestRate,
      collateralTokenURI,
      collateralName,
      status,
      createdAtTimestamp,
      lastUpdatedAtTimestamp,
      numEvents,
    });

    // freeze date for calculations
    Date.now = jest.fn(() => 1487076708000);
  });

  it('parses values correctly', () => {
    expect(result()).toEqual({
      id: ethers.BigNumber.from(id),
      loanAmount: ethers.BigNumber.from(loanAmount),
      collateralTokenId: ethers.BigNumber.from(collateralTokenId),
      collateralContractAddress: ethers.utils.getAddress(
        collateralContractAddress,
      ),
      collateralName,
      createdAtTimestamp,
      durationSeconds: ethers.BigNumber.from(durationSeconds),
      endDateTimestamp,
      loanAssetDecimal,
      loanAssetDecimals: loanAssetDecimal,
      closed,
      loanAssetSymbol,
      loanAssetContractAddress: ethers.utils.getAddress(
        loanAssetContractAddress,
      ),
      accumulatedInterest: ethers.BigNumber.from(accumulatedInterest),
      borrowTicketHolder,
      borrower: ethers.utils.getAddress(borrowTicketHolder),
      lendTicketHolder,
      lender: ethers.utils.getAddress(lendTicketHolder),
      perAnumInterestRate: ethers.BigNumber.from(perAnumInterestRate),
      lastAccumulatedTimestamp: ethers.BigNumber.from(lastAccumulatedTimestamp),
      interestOwed: ethers.BigNumber.from('0'),
      collateralTokenURI,
      status,
      lastUpdatedAtTimestamp,
      numEvents,
    });
  });

  describe('when last accumulated timestamp is not 0', () => {
    beforeAll(() => {
      lastAccumulatedTimestamp = '1638912108';
      subgraphLoan = { ...subgraphLoan, lastAccumulatedTimestamp };
    });

    it('correctly computes interest owed', () => {
      const bigLoanAmount = ethers.BigNumber.from(loanAmount);
      const now = ethers.BigNumber.from(Date.now()).div(1000);

      const interestOwed = bigLoanAmount
        .mul(now.sub(lastAccumulatedTimestamp))
        .mul(perAnumInterestRate)
        .div(SCALAR)
        .add(accumulatedInterest);

      // NOTE: the mock data is probably not realistic because this comes out as a negative number...
      expect(result().interestOwed).toEqual(interestOwed);
    });
  });
});
