import { onMainnet, onOptimism, onRinkeby } from 'lib/chainEnv';
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
    case onMainnet:
      return collectionStatsEthMainnet(contractAddress);
    case onOptimism:
      return collectionStatsOptimism(contractAddress);
    case onRinkeby:
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
