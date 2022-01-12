import { ethers } from 'ethers';
import { mainnet } from 'lib/chainEnv';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { getFakeFloor, getNFTFloor } from 'lib/nftPort';
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
  floorPrice: number;
};

export async function getCollateralSaleInfo(
  nftContractAddress: string,
  tokenId: string,
): Promise<CollateralSaleInfo> {
  const recentSale = await getMostRecentSale(nftContractAddress, tokenId);
  const erc20Contract = jsonRpcERC20Contract(recentSale.paymentToken);

  const recentSaleToken = await erc20Contract.symbol();
  const recentSalePrice = ethers.BigNumber.from(recentSale.price).toNumber();

  return {
    floorPrice: await getFloorPrice(nftContractAddress),
    recentSale: {
      paymentToken: recentSaleToken,
      price: recentSalePrice,
    },
  };
}

async function getMostRecentSale(
  nftContractAddress: string,
  tokenId: string,
): Promise<NFTSale> {
  if (!mainnet()) return generateFakeSaleForNFT(nftContractAddress, tokenId);
  return await queryMostRecentSaleForNFT(nftContractAddress, tokenId);
}

async function getFloorPrice(nftContractAddress: string): Promise<number> {
  if (!mainnet()) return getFakeFloor();
  return await getNFTFloor(nftContractAddress);
}
