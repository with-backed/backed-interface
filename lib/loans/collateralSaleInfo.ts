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
  };
  collectionStats: CollectionStatistics;
};

export async function getCollateralSaleInfo(
  nftContractAddress: string,
  tokenId: string,
): Promise<CollateralSaleInfo | null> {
  const recentSale = await getMostRecentSale(nftContractAddress, tokenId);

  if (!recentSale) {
    return null;
  }

  const erc20Contract = jsonRpcERC20Contract(recentSale.paymentToken);

  const recentSaleToken = await erc20Contract.symbol();
  const recentSaleTokenDecimals = await erc20Contract.decimals();

  const recentSalePrice = ethers.utils
    .parseUnits(recentSale.price, recentSaleTokenDecimals)
    .toNumber();

  const collectionStats = await getCollectionStats(nftContractAddress);

  return {
    collectionStats,
    recentSale: {
      paymentToken: recentSaleToken,
      price: recentSalePrice,
    },
  };
}

async function getMostRecentSale(
  nftContractAddress: string,
  tokenId: string,
): Promise<NFTSale | null> {
  if (!mainnet()) return generateFakeSaleForNFT(nftContractAddress, tokenId);
  return await queryMostRecentSaleForNFT(nftContractAddress, tokenId);
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
