import { ethers } from 'ethers';
import { SupportedNetwork } from 'lib/config';
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
  nftSalesSubgraph: string | null,
  network: SupportedNetwork,
): Promise<CollateralSaleInfo> {
  const recentSale = await getMostRecentSale(
    nftContractAddress,
    tokenId,
    nftSalesSubgraph,
    network,
  );

  const collectionStats = await getCollectionStats(nftContractAddress, network);

  return {
    collectionStats,
    recentSale,
  };
}

async function getMostRecentSale(
  nftContractAddress: string,
  tokenId: string,
  nftSalesSubgraph: string | null,
  network: SupportedNetwork,
): Promise<{ paymentToken: string; price: number } | null> {
  let sale: NFTSale | null = null;

  switch (network) {
    case 'ethereum':
      sale = await queryMostRecentSaleForNFT(
        nftContractAddress,
        tokenId,
        nftSalesSubgraph,
      );
      if (!sale) return null;
      break;
    case 'rinkeby':
      sale = generateFakeSaleForNFT(nftContractAddress, tokenId);
    default:
      // TODO(adamgobes): follow up with Quixotic team on when they will release API to get most recent sale. it is not available for now
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
