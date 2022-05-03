import { ethers } from 'ethers';
import { onMainnet, onOptimism, onRinkeby } from 'lib/chainEnv';
import { jsonRpcERC20Contract } from 'lib/contracts';
import {
  CollectionStatistics,
  getCollectionStats,
} from 'lib/nftCollectionStats';
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

  switch (true) {
    case onMainnet:
      sale = await queryMostRecentSaleForNFT(nftContractAddress, tokenId);
      if (!sale) return null;
      break;
    case onOptimism:
      // TODO(adamgobes): follow up with Quixotic team on when they will release API to get most recent sale. it is not available for now
      return null;
    case onRinkeby:
      sale = generateFakeSaleForNFT(nftContractAddress, tokenId);
    default:
      return null;
  }

  const paymentTokenAddress = sale.paymentToken;
  const price = sale.price;

  const erc20Contract = jsonRpcERC20Contract(paymentTokenAddress);

  let paymentTokenSymbol: string;
  let recentSaleTokenDecimals: number;
  if (paymentTokenAddress === '0x0000000000000000000000000000000000000000') {
    paymentTokenSymbol = 'ETH';
    recentSaleTokenDecimals = 18;
  } else {
    paymentTokenSymbol = await erc20Contract.symbol();
    recentSaleTokenDecimals = await erc20Contract.decimals();
  }

  const formatttedPrice = ethers.utils.formatUnits(
    ethers.BigNumber.from(price),
    recentSaleTokenDecimals,
  );

  return {
    paymentToken: paymentTokenSymbol,
    price: parseFloat(formatttedPrice),
  };
}
