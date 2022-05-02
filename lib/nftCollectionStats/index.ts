import { mainnet, optimism, rinkeby } from 'lib/chainEnv';
import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/nftPort';
import { collectionStatsOptimism } from 'lib/nftCollectionStats/quixotic';
import { collectionStatsRinkeby } from 'lib/nftCollectionStats/mockData';

export type CollectionStatistics = {
  floor: number | null;
  items: number | null;
  owners: number | null;
  volume: number | null;
};

export async function getCollectionStats(
  contractAddress: string,
): Promise<CollectionStatistics> {
  switch (true) {
    case mainnet():
      return collectionStatsEthMainnet(contractAddress);
    case optimism():
      return collectionStatsOptimism(contractAddress);
    case rinkeby():
      return collectionStatsRinkeby();
    default:
      return nullCollectionStats;
  }
}

const nullCollectionStats: CollectionStatistics = {
  floor: null,
  items: null,
  owners: null,
  volume: null,
};
