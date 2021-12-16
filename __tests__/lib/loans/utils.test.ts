import { ethers } from 'ethers';
import { LoanInfo } from 'lib/LoanInfoType';
import { SubgraphLoanEntity } from 'lib/loans/sharedLoanSubgraphConstants';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { before } from 'lodash';
import { Context } from 'urql';

describe('parseSubgraphLoan', () => {
  let accumulatedInterest = '186000000000000';
  let borrowTicketHolder = '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4';
  let closed = false;
  let collateralContractAddress = '0x325a0dd968cafaf2cc01232564c49ad0b1d71313';
  let collateralTokenId = '1';
  let durationSeconds = '864000';
  let endDateTimestamp = 1639776108;
  let id = '1';
  let lastAccumulatedTimestamp = '1638912108';
  let lendTicketHolder = '0xbc3ed6b537f2980e66f396fe14210a56ba3f72c4';
  let loanAmount = '1000000000000000000000';
  let loanAssetContractAddress = '0x6916577695d0774171de3ed95d03a3239139eddb';
  let loanAssetDecimal = 18;
  let loanAssetSymbol = 'DAI';
  let perSecondInterestRate = '15';
  let subgraphLoan: SubgraphLoanEntity;

  function result(): LoanInfo {
    return parseSubgraphLoan(subgraphLoan);
  }

  beforeEach(() => {
    subgraphLoan = {
      accumulatedInterest: accumulatedInterest,
      borrowTicketHolder: borrowTicketHolder,
      closed: closed,
      collateralContractAddress: collateralContractAddress,
      collateralTokenId: collateralTokenId,
      durationSeconds: durationSeconds,
      endDateTimestamp: endDateTimestamp,
      id: id,
      lastAccumulatedTimestamp: lastAccumulatedTimestamp,
      lendTicketHolder: lendTicketHolder,
      loanAmount: loanAmount,
      loanAssetContractAddress: loanAssetContractAddress,
      loanAssetDecimal: loanAssetDecimal,
      loanAssetSymbol: loanAssetSymbol,
      perSecondInterestRate: perSecondInterestRate,
    };

    // freeze date for calculations
    Date.now = jest.fn(() => 1487076708000);
  });

  it('parses values correctly', () => {
    expect(result().loanId).toEqual(ethers.BigNumber.from(id));
    expect(result().loanAmount).toEqual(ethers.BigNumber.from(loanAmount));
    expect(result().collateralTokenId).toEqual(
      ethers.BigNumber.from(collateralTokenId),
    );
    expect(result().collateralContractAddress).toEqual(
      collateralContractAddress,
    );
    expect(result().durationSeconds).toEqual(
      ethers.BigNumber.from(durationSeconds),
    );
    expect(result().endDateTimestamp).toEqual(endDateTimestamp);
    expect(result().loanAssetDecimals).toEqual(loanAssetDecimal);
    expect(result().closed).toEqual(closed);
    expect(result().loanAssetSymbol).toEqual(loanAssetSymbol);
    expect(result().loanAssetContractAddress).toEqual(loanAssetContractAddress);
    expect(result().accumulatedInterest).toEqual(
      ethers.BigNumber.from(accumulatedInterest),
    );
    expect(result().borrower).toEqual(borrowTicketHolder);
    expect(result().lender).toEqual(lendTicketHolder);
    expect(result().perSecondInterestRate).toEqual(
      ethers.BigNumber.from(perSecondInterestRate),
    );
  });

  it('correctly computes interest owed', () => {
    const bigLoanAmount = ethers.BigNumber.from(loanAmount);
    const bigPerSecondInterestRate = ethers.BigNumber.from(
      perSecondInterestRate,
    );
    const bigAccumulatedInterest = ethers.BigNumber.from(accumulatedInterest);
    const bigLastAccumulatedTimestamp = ethers.BigNumber.from(
      lastAccumulatedTimestamp,
    );
    const now = ethers.BigNumber.from(Date.now());
    let interestOwed = ethers.BigNumber.from(0);
    interestOwed = bigLoanAmount
      .mul(bigPerSecondInterestRate)
      .mul(now.sub(bigLastAccumulatedTimestamp))
      .add(bigAccumulatedInterest);

    expect(result().interestOwed).toEqual(interestOwed);
  });

  describe('when last accumulated timestamp is 0', () => {
    beforeEach(() => {
      subgraphLoan.lastAccumulatedTimestamp = '0';
    });

    it('correctly computes interest owed', () => {
      expect(result().interestOwed).toEqual(ethers.BigNumber.from(0));
    });
  });
});
