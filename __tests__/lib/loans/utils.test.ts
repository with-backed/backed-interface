import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import {
  Loan as SubgraphLoan,
  LoanStatus,
} from 'types/generated/graphql/nftLoans';
import { parseSubgraphLoan } from 'lib/loans/utils';

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
  let lendTicketHolder = '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4';
  let loanAmount = '1000000000000000000000';
  let loanAssetContractAddress = '0x6916577695d0774171de3ed95d03a3239139eddb';
  let loanAssetDecimal = 18;
  let loanAssetSymbol = 'DAI';
  let perSecondInterestRate = '15';
  const collateralTokenURI = 'gopher://gopher.pawnshop.internet';
  const collateralName = 'This is a name';
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
      perSecondInterestRate,
      collateralTokenURI,
      collateralName,
      status,
      createdAtTimestamp,
    });

    // freeze date for calculations
    Date.now = jest.fn(() => 1487076708000);
  });

  it('parses values correctly', () => {
    expect(result()).toEqual(
      expect.objectContaining({
        id: ethers.BigNumber.from(id),
        loanAmount: ethers.BigNumber.from(loanAmount),
        collateralTokenId: ethers.BigNumber.from(collateralTokenId),
        collateralContractAddress,
        durationSeconds: ethers.BigNumber.from(durationSeconds),
        endDateTimestamp,
        loanAssetDecimal,
        loanAssetDecimals: loanAssetDecimal,
        closed,
        loanAssetSymbol,
        loanAssetContractAddress,
        accumulatedInterest: ethers.BigNumber.from(accumulatedInterest),
        borrowTicketHolder,
        borrower: borrowTicketHolder,
        lendTicketHolder,
        lender: lendTicketHolder,
        perSecondInterestRate: ethers.BigNumber.from(perSecondInterestRate),
        lastAccumulatedTimestamp: ethers.BigNumber.from(
          lastAccumulatedTimestamp,
        ),
        interestOwed: ethers.BigNumber.from('0'),
        collateralTokenURI,
      }),
    );
  });

  describe('when last accumulated timestamp is not 0', () => {
    beforeAll(() => {
      lastAccumulatedTimestamp = '1638912108';
      subgraphLoan = { ...subgraphLoan, lastAccumulatedTimestamp };
    });

    it('correctly computes interest owed', () => {
      const bigLoanAmount = ethers.BigNumber.from(loanAmount);
      const now = ethers.BigNumber.from(Date.now());
      let interestOwed = bigLoanAmount
        .mul(perSecondInterestRate)
        .mul(now.sub(lastAccumulatedTimestamp))
        .add(accumulatedInterest);

      expect(result().interestOwed).toEqual(interestOwed);
    });
  });
});
