import { ethers } from 'ethers';

export type TicketInfo = {
  ticketNumber: string;
  loanAsset: string;
  collateralAddress: string;
  collateralID: ethers.BigNumber;
  perSecondInterestRate: ethers.BigNumber;
  accumulatedInterest: ethers.BigNumber;
  lastAccumulatedTimestamp: ethers.BigNumber;
  durationSeconds: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  closed: boolean;
  collateralSeized: boolean;
  loanAssetDecimals: number;
  loanAssetSymbol: string;
  loanOwner: string;
  ticketOwner: string;
  interestOwed: ethers.BigNumber;
};
