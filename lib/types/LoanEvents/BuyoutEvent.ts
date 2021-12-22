import { ethers } from 'ethers';
import { BaseLoanEvent } from './BaseLoanEvent';

export type BuyoutEvent = BaseLoanEvent & {
  kind: 'buyout';
  newLender: string;
  previousLender: string;
  interestEarned: ethers.BigNumber;
  principalRepaid: ethers.BigNumber;
};
