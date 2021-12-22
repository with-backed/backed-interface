import { ethers } from 'ethers';
import { BaseLoanEvent } from './BaseLoanEvent';

export type RepayEvent = BaseLoanEvent & {
  kind: 'repay';
  repayer: string;
  paidTo: string;
  loanAmount: ethers.BigNumber;
  interestEarned: ethers.BigNumber;
};
