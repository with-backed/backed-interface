import { ethers } from 'ethers';
import { BaseLoanEvent } from './BaseLoanEvent';

export type CreateLoanEvent = BaseLoanEvent & {
  kind: 'create';
  creator: string;
  maxPerSecondInterestRate: ethers.BigNumber;
  minLoanAmount: ethers.BigNumber;
  minDurationSeconds: ethers.BigNumber;
};
