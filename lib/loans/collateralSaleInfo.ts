import { SupportedNetwork } from 'lib/config';
import {
  CollectionStatistics,
  getCollectionStats,
} from 'lib/nftCollectionStats';

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
  jsonRpcProvider: string,
): Promise<CollateralSaleInfo> {
  const recentSale = await getMostRecentSale(
    nftContractAddress,
    tokenId,
    nftSalesSubgraph,
    network,
    jsonRpcProvider,
  );

  const collectionStats = await getCollectionStats(
    nftContractAddress,
    tokenId,
    network,
  );

  return {
    collectionStats,
    recentSale,
  };
}

async function getMostRecentSale(
  nftContractAddress: string,
  tokenId: string,
  _nftSalesSubgraph: string | null, // TODO: deprecate
  network: SupportedNetwork,
  jsonRpcProvider: string,
): Promise<{ paymentToken: string; price: number } | null> {
  // deprecating most recent sale, return null and UI will handle

  return null;
}
