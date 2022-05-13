import { captureException } from '@sentry/nextjs';
import { ethers } from 'ethers';
import {
  Sale as NFTSale,
  SalesByAddressDocument,
  SalesByAddressQuery,
  SaleType,
  Sale_OrderBy,
} from 'types/generated/graphql/nftSales';
import { clientFromUrl } from './urql';

export async function queryMostRecentSaleForNFT(
  nftContractAddress: string,
  nftTokenId: string,
  nftSalesSubgraph: string | null,
): Promise<NFTSale | null> {
  if (!nftSalesSubgraph) {
    return null;
  }
  const nftSalesClient = clientFromUrl(nftSalesSubgraph);
  const { data, error } = await nftSalesClient
    .query<SalesByAddressQuery>(SalesByAddressDocument, {
      nftContractAddress,
      nftTokenId,
      first: 1,
      orderBy: Sale_OrderBy.Timestamp,
      orderDirection: 'desc',
    })
    .toPromise();

  if (error) {
    captureException(error);
  }

  if (data?.sales && data.sales.length > 0) {
    return data.sales[0];
  }

  return null;
}

// MOCK METHODS TO GENERATE FAKE SALES FOR RINKEBY

const NFT_EXCHANGES = {
  '0x5206e78b21ce315ce284fb24cf05e0585a93b1d9': 'OpenSea',
  '0xE7dd1252f50B3d845590Da0c5eADd985049a03ce': 'Zora',
};

const PAYMENT_TOKENS: any = {
  '0xc778417e063141139fce010982780140aa0cd5ab': 'WETH',
  '0x6916577695D0774171De3ED95d03A3239139Eddb': 'DAI',
};

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
): NFTSale => {
  return {
    id: genRanHex(),
    blockNumber: ethers.BigNumber.from(randomNumber(1000000)).toString(),
    buyer: genRanHex(),
    seller: genRanHex(),
    nftContractAddress,
    nftTokenId,
    saleType: SaleType.Single,
    paymentToken: Object.keys(PAYMENT_TOKENS)[randomNumber(1)],
    price: '12500000000000000000',
    exchange: Object.keys(NFT_EXCHANGES)[randomNumber(1)],
    timestamp: new Date(2020, randomNumber(11), 15).getTime(),
  };
};
