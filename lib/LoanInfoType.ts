import { ethers } from 'ethers';

export type LoanInfo = {
  loanId: ethers.BigNumber;
  loanAssetContractAddress: string;
  collateralContractAddress: string;
  collateralTokenId: ethers.BigNumber;
  perSecondInterestRate: ethers.BigNumber;
  accumulatedInterest: ethers.BigNumber;
  lastAccumulatedTimestamp: ethers.BigNumber;
  durationSeconds: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  closed: boolean;
  loanAssetDecimals: number;
  loanAssetSymbol: string;
  lender: string | null;
  borrower: string;
  interestOwed: ethers.BigNumber;
  endDateTimestamp: number;
};
