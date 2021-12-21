import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';

export const now = 1000000000;
const durationSeconds = 259200;

export const baseLoan: Loan = {
  accumulatedInterest: ethers.BigNumber.from('0'),
  borrower: '0x70a85de679bc98acf97d2f890e2466cd69933cc4',
  closed: false,
  collateralContractAddress: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966',
  collateralTokenId: ethers.BigNumber.from('37'),
  collateralTokenURI:
    'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/37',
  durationSeconds: ethers.BigNumber.from(durationSeconds),
  endDateTimestamp: 0,
  id: ethers.BigNumber.from('8'),
  lender: null,
  loanAmount: ethers.BigNumber.from('10000000000000000000'),
  loanAssetContractAddress: '0x6916577695d0774171de3ed95d03a3239139eddb',
  loanAssetDecimals: 18,
  loanAssetSymbol: 'DAI',
  perSecondInterestRate: ethers.BigNumber.from('15'),
  lastAccumulatedTimestamp: ethers.BigNumber.from(0),
  interestOwed: ethers.BigNumber.from(0),
};

export const loanWithLenderAccruing: Loan = {
  ...baseLoan,
  lender: '0x6c8e3b98b28aaa2c409d1b25f78971a4d90165fe',
  lastAccumulatedTimestamp: ethers.BigNumber.from(now - 10),
  interestOwed: ethers.BigNumber.from('3888000000000000'),
};

export const loanWithLenderPastDue: Loan = {
  ...loanWithLenderAccruing,
  lastAccumulatedTimestamp: ethers.BigNumber.from(now - durationSeconds),
};

export const closedLoan: Loan = {
  ...loanWithLenderAccruing,
  closed: true,
};
