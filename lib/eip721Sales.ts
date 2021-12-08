import { ethers } from 'ethers';

const NFT_EXCHANGES = {
  '0x5206e78b21ce315ce284fb24cf05e0585a93b1d9': 'OpenSea',
  '0xE7dd1252f50B3d845590Da0c5eADd985049a03ce': 'Zora',
};

const PAYMENT_TOKENS = {
  '0x0': 'ETH',
  '0xc778417e063141139fce010982780140aa0cd5ab': 'WETH',
  '0x6916577695D0774171De3ED95d03A3239139Eddb': 'DAI',
};

export interface NFTSaleEntity {
  id: string;
  nftContractAddress: string;
  nftTokenId: string;
  saleType: string;
  blockNumber: ethers.BigNumber;
  timestamp: ethers.BigNumber;
  seller: string;
  buyer: string;
  exchange: string;
  paymentToken: string;
  price: ethers.BigNumber;
}

const genRanHex = (size: number = 40) =>
  '0x' +
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

const randomNumber = (upperBound: number) =>
  Math.floor(Math.random() * (upperBound + 1));

export const generateFakeSaleForNFT = (
  nftContractAddress: string,
  nftTokenId: string,
): NFTSaleEntity => {
  return {
    id: genRanHex(),
    blockNumber: ethers.BigNumber.from(randomNumber(1000000)),
    buyer: genRanHex(),
    seller: genRanHex(),
    nftContractAddress,
    nftTokenId,
    saleType: 'SINGLE',
    paymentToken: Object.keys(PAYMENT_TOKENS)[randomNumber(2)],
    price: ethers.BigNumber.from(randomNumber(1000)),
    exchange: Object.keys(NFT_EXCHANGES)[randomNumber(1)],
    timestamp: ethers.BigNumber.from(
      new Date(2020, randomNumber(11), 15).getTime(),
    ),
  };
};
