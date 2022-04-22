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
  if (!mainnet()) return generateFakeSaleForNFT(nftContractAddress, tokenId);

  const recentSaleFromGraph = await queryMostRecentSaleForNFT(
    nftContractAddress,
    tokenId,
  );
  if (!recentSaleFromGraph) {
    return null;
  }

  const erc20Contract = jsonRpcERC20Contract(recentSaleFromGraph.paymentToken);

  const paymentToken = await erc20Contract.symbol();
  const recentSaleTokenDecimals = await erc20Contract.decimals();

  const price = ethers.utils
    .parseUnits(recentSaleFromGraph.price, recentSaleTokenDecimals)
    .toNumber();

  return {
    paymentToken,
    price,
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
