import { ethers } from 'ethers';
import { SCALAR } from 'lib/constants';
import { Loan } from 'types/Loan';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';

export function parseSubgraphLoan(loan: SubgraphLoan): Loan {
  const loanAmount = ethers.BigNumber.from(loan.loanAmount);
  const perSecondInterestRate = ethers.BigNumber.from(
    loan.perSecondInterestRate,
  );
  const accumulatedInterest = ethers.BigNumber.from(loan.accumulatedInterest);
  const lastAccumulatedTimestamp = ethers.BigNumber.from(
    loan.lastAccumulatedTimestamp,
  );
  const now = ethers.BigNumber.from(Date.now()).div(1000);
  let interestOwed = ethers.BigNumber.from(0);
  if (!lastAccumulatedTimestamp.eq(0)) {
    interestOwed = loanAmount
      .mul(now.sub(lastAccumulatedTimestamp))
      .mul(perSecondInterestRate)
      .div(SCALAR)
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
    lender: loan.lendTicketHolder || null,
    borrower:
      loan.borrowTicketHolder || '0x0000000000000000000000000000000000000000',
    interestOwed: interestOwed,
    endDateTimestamp: loan.endDateTimestamp || 0,
  };
}
