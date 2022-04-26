import { ethers } from 'ethers';
import { mainnet } from 'lib/chainEnv';
import { jsonRpcERC20Contract } from 'lib/contracts';
import {
  CollectionStatistics,
  collectionStats,
  getFakeFloor,
  getFakeItemsAndOwners,
  getFakeVolume,
} from 'lib/nftPort';
import {
  generateFakeSaleForNFT,
  queryMostRecentSaleForNFT,
} from 'lib/nftSalesSubgraph';
import { Sale as NFTSale } from 'types/generated/graphql/nftSales';

export type CollateralSaleInfo = {
  recentSale: {
    paymentToken: string;
    price: number;
  } | null;
  collectionStats: CollectionStatistics;
};

export async function getCollateralSaleInfo(
  nftContractAddress: string,
  tokenId: string,
): Promise<CollateralSaleInfo> {
  const recentSale = await getMostRecentSale(nftContractAddress, tokenId);

  const collectionStats = await getCollectionStats(nftContractAddress);

  return {
    collectionStats,
    recentSale,
  };
}

async function getMostRecentSale(
  nftContractAddress: string,
  tokenId: string,
): Promise<{ paymentToken: string; price: number } | null> {
  let sale: NFTSale | null = null;

  if (!mainnet()) {
    sale = generateFakeSaleForNFT(nftContractAddress, tokenId);
  } else {
    sale = await queryMostRecentSaleForNFT(nftContractAddress, tokenId);
    if (
      !sale ||
      sale.paymentToken === '0x0000000000000000000000000000000000000000'
    ) {
      return null;
    }
  }

  const paymentTokenAddress = sale.paymentToken;
  const price = sale.price;

  const erc20Contract = jsonRpcERC20Contract(paymentTokenAddress);

  const paymentTokenSymbol = await erc20Contract.symbol();
  const recentSaleTokenDecimals = await erc20Contract.decimals();

  const formatttedPrice = ethers.utils
    .parseUnits(price, recentSaleTokenDecimals)
    .toNumber();

  return {
    paymentToken: paymentTokenSymbol,
    price: formatttedPrice,
  };
}

async function getCollectionStats(
  nftContractAddress: string,
): Promise<CollectionStatistics> {
  if (!mainnet()) {
    const [items, owners] = getFakeItemsAndOwners();
    return {
      floor: getFakeFloor(),
      items,
      owners,
      volume: getFakeVolume(),
    };
  }
  return await collectionStats(nftContractAddress);
}
