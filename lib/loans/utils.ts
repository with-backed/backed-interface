import { ethers } from 'ethers';
import { SCALAR, SECONDS_IN_A_YEAR } from 'lib/constants';
import { Loan } from 'types/Loan';
import {
  Loan as SubgraphLoan,
  LoanByIdQuery,
} from 'types/generated/graphql/nftLoans';

export function parseSubgraphLoan(subgraphLoan: LoanByIdQuery['loan']): Loan;
/** TODO: deprecate SubgraphLoan in favor of new type */
export function parseSubgraphLoan(subgraphLoan: SubgraphLoan): Loan;
export function parseSubgraphLoan(subgraphLoan: unknown): Loan {
  const loan = (subgraphLoan as LoanByIdQuery['loan'])!;
  const loanAmount = ethers.BigNumber.from(loan.loanAmount);
  const perAnumInterestRate = ethers.BigNumber.from(loan.perAnumInterestRate);
  const accumulatedInterest = ethers.BigNumber.from(loan.accumulatedInterest);
  const lastAccumulatedTimestamp = ethers.BigNumber.from(
    loan.lastAccumulatedTimestamp,
  );
  const now = ethers.BigNumber.from(Date.now()).div(1000);
  let interestOwed = ethers.BigNumber.from(0);
  if (!lastAccumulatedTimestamp.eq(0)) {
    interestOwed = getInterestOwed(
      now,
      loanAmount,
      lastAccumulatedTimestamp,
      perAnumInterestRate,
      accumulatedInterest,
    );
  }

  return {
    ...loan,
    id: ethers.BigNumber.from(loan.id),
    collateralTokenId: ethers.BigNumber.from(loan.collateralTokenId),
    perAnumInterestRate: perAnumInterestRate,
    accumulatedInterest: accumulatedInterest,
    lastAccumulatedTimestamp: lastAccumulatedTimestamp,
    durationSeconds: ethers.BigNumber.from(loan.durationSeconds),
    loanAmount: loanAmount,
    loanAssetDecimals: loan.loanAssetDecimal,
    lender: loan.lendTicketHolder
      ? ethers.utils.getAddress(loan.lendTicketHolder)
      : null,
    borrower: loan.borrowTicketHolder
      ? ethers.utils.getAddress(loan.borrowTicketHolder)
      : '0x0000000000000000000000000000000000000000',
    interestOwed: interestOwed,
    endDateTimestamp: loan.endDateTimestamp || 0,
    loanAssetContractAddress: ethers.utils.getAddress(
      loan.loanAssetContractAddress,
    ),
    collateralContractAddress: ethers.utils.getAddress(
      loan.collateralContractAddress,
    ),
  };
}

export function getInterestOwed(
  now: ethers.BigNumber,
  loanAmount: ethers.BigNumber,
  lastAccumulatedTimestamp: ethers.BigNumber,
  perAnumInterestRate: ethers.BigNumber,
  accumulatedInterest: ethers.BigNumber,
): ethers.BigNumber {
  return loanAmount
    .mul(now.sub(lastAccumulatedTimestamp))
    .mul(perAnumInterestRate)
    .div(SCALAR)
    .add(accumulatedInterest);
}

// Less exact but good enough and more friendly
// E.g. 10% on 10 DAI for 1 year will be 1 DAI rather than
// 9.999999999979632 DAI
export function estimatedRepayment(
  interestRate: ethers.BigNumber, // scaled: 0.1% = 1
  durationDays: ethers.BigNumber,
  loanAmount: ethers.BigNumber,
  loanAssetDecimals: number,
) {
  const interest = interestRate
    .mul(loanAmount)
    .mul(
      durationDays
        .mul(1000) // prevent dividing to 0
        .div(365),
    )
    .div(1000) // removing duration scaling
    .div(1000); // remove interest scaling

  return ethers.utils.formatUnits(interest.add(loanAmount), loanAssetDecimals);
}

// this function matches exactly the computation
// in the contract, however in most cases we will
// likely just want
// interest = amount * rate / (durationDays / 365)
export function estimatedRepaymentExact(
  interestRate: ethers.BigNumber,
  durationSeconds: ethers.BigNumber,
  loanAmount: ethers.BigNumber,
  loanAssetDecimals: number,
) {
  const parsedLoanAmount = ethers.utils.parseUnits(
    loanAmount.toString(),
    loanAssetDecimals,
  );

  const interestOverTerm = parsedLoanAmount
    .mul(durationSeconds)
    .mul(
      interestRate
        .mul(ethers.BigNumber.from(10).pow(18))
        .div(SECONDS_IN_A_YEAR),
    )
    .div(ethers.BigNumber.from(10).pow(18))
    .div(SCALAR);

  return ethers.utils.formatUnits(
    interestOverTerm.add(parsedLoanAmount),
    loanAssetDecimals,
  );
}
