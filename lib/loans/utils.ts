import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';
import { SubgraphLoan } from 'lib/types/SubgraphLoan';

export function parseSubgraphLoan(loan: SubgraphLoan): Loan {
  const loanAmount = ethers.BigNumber.from(loan.loanAmount);
  const perSecondInterestRate = ethers.BigNumber.from(
    loan.perSecondInterestRate,
  );
  const accumulatedInterest = ethers.BigNumber.from(loan.accumulatedInterest);
  const lastAccumulatedTimestamp = ethers.BigNumber.from(
    loan.lastAccumulatedTimestamp,
  );
  const now = ethers.BigNumber.from(Date.now());
  let interestOwed = ethers.BigNumber.from(0);
  if (!lastAccumulatedTimestamp.eq(0)) {
    interestOwed = loanAmount
      .mul(perSecondInterestRate)
      .mul(now.sub(lastAccumulatedTimestamp))
      .add(accumulatedInterest);
  }

  return {
    ...loan,
    id: ethers.BigNumber.from(loan.id),
    collateralTokenId: ethers.BigNumber.from(loan.collateralTokenId),
    perSecondInterestRate: perSecondInterestRate,
    accumulatedInterest: accumulatedInterest,
    lastAccumulatedTimestamp: lastAccumulatedTimestamp,
    durationSeconds: ethers.BigNumber.from(loan.durationSeconds),
    loanAmount: loanAmount,
    loanAssetDecimals: loan.loanAssetDecimal,
    lender: loan.lendTicketHolder,
    borrower: loan.borrowTicketHolder,
    interestOwed: interestOwed,
  };
}
