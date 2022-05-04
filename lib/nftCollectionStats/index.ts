import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/nftPort';
import { collectionStatsOptimism } from 'lib/nftCollectionStats/quixotic';
import { collectionStatsRinkeby } from 'lib/nftCollectionStats/mockData';
import { config } from 'lib/config';

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
    case config.onEthereumMainnet:
      return collectionStatsEthMainnet(contractAddress);
    case config.onOptimismMainnet:
      return collectionStatsOptimism(contractAddress);
    case config.onEthereumRinkeby:
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
