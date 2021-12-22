import { ethers } from 'ethers';
import { BaseLoanEvent } from './BaseLoanEvent';

export type LendEvent = BaseLoanEvent & {
  kind: 'lend';
  lender: string;
  interestRate: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  durationSeconds: ethers.BigNumber;
};
