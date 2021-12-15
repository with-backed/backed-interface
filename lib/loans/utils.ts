import { ethers } from 'ethers';
import { LoanInfo } from 'lib/LoanInfoType';
import { SubgraphLoanEntity } from './sharedLoanSubgraphConstants';

export function parseSubgraphLoan(loan: SubgraphLoanEntity): LoanInfo {
  const loanAmount = ethers.BigNumber.from(loan.loanAmount);
  const perSecondInterestRate = ethers.BigNumber.from(
    loan.perSecondInterestRate,
  );
  const accumulatedInterest = ethers.BigNumber.from(loan.accumulatedInterest);
  const lastAccumulatedTimestamp = ethers.BigNumber.from(
    loan.lastAccumulatedTimestamp,
  );
  const now = ethers.BigNumber.from(Date.now().toString());
  let interestOwed = ethers.BigNumber.from(0);
  if (!lastAccumulatedTimestamp.eq(0)) {
    interestOwed = loanAmount
      .mul(perSecondInterestRate)
      .mul(now.sub(lastAccumulatedTimestamp))
      .add(accumulatedInterest);
  }

  return {
    loanId: ethers.BigNumber.from(loan.id),
    loanAssetContractAddress: loan.loanAssetContractAddress,
    collateralContractAddress: loan.collateralContractAddress,
    collateralTokenId: ethers.BigNumber.from(loan.collateralTokenId),
    perSecondInterestRate: perSecondInterestRate,
    accumulatedInterest: accumulatedInterest,
    lastAccumulatedTimestamp: lastAccumulatedTimestamp,
    durationSeconds: ethers.BigNumber.from(loan.durationSeconds),
    loanAmount: loanAmount,
    closed: loan.closed,
    loanAssetDecimals: loan.loanAssetDecimal,
    loanAssetSymbol: loan.loanAssetSymbol,
    lender: loan.lendTicketHolder,
    borrower: loan.borrowTicketHolder,
    interestOwed: interestOwed,
  };
}
