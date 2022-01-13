import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import type { CreateEvent, Event, LendEvent } from 'types/Event';
import { CollateralSaleInfo } from './loans/collateralSaleInfo';
import { generateFakeSaleForNFT } from './nftSalesSubgraph';
import { getFakeFloor } from './nftPort';

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
  collateralName: 'The Best NFT Ever',
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

const createEvent: CreateEvent = {
  blockNumber: 9808300,
  minter: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
  id: '0x662993eef512ffe276ba4b86121626eba009b56fcdc98dfb18f12d749c58f1dc',
  maxInterestRate: ethers.BigNumber.from('15'),
  minDurationSeconds: ethers.BigNumber.from('259200'),
  minLoanAmount: ethers.BigNumber.from('10000000000000000000'),
  timestamp: 1639409386,
  typename: 'CreateEvent',
};

const lendEvents: LendEvent[] = [
  {
    blockNumber: 9950758,
    durationSeconds: ethers.BigNumber.from('432000'),
    id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
    underwriter: '0x10359616ab170c1bd6c478a40c6715a49ba25efc',
    loanAmount: ethers.BigNumber.from('10000000000000000000'),
    interestRate: ethers.BigNumber.from('11'),
    timestamp: 1641574026,
    typename: 'LendEvent',
  },
  {
    blockNumber: 9934164,
    durationSeconds: ethers.BigNumber.from('259200'),
    id: '0xc99d7b9eeca31f9de0bdb9a5f8e29ad2f3a0291e34b265271f8bea30a3755d93',
    underwriter: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    loanAmount: ethers.BigNumber.from('10000000000000000000'),
    interestRate: ethers.BigNumber.from('15'),
    timestamp: 1641324990,
    typename: 'LendEvent',
  },
];

export const events: Event[] = [createEvent, ...lendEvents].sort(
  (a, b) => b.blockNumber - a.blockNumber,
);

export const saleInfo: CollateralSaleInfo = {
  recentSale: generateFakeSaleForNFT(
    '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966',
    '10',
  ),
  floorPrice: getFakeFloor(),
};
