import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/resevoir';
import { collectionStatsRinkeby } from 'lib/nftCollectionStats/mockData';
import { SupportedNetwork } from 'lib/config';
import { collectionStatsOptimism } from 'lib/nftCollectionStats/quixotic';

export type CollectionStatistics = {
  floor: number | null;
  items: number | null;
  owners: number | null;
  volume: number | null;
};

export async function getCollectionStats(
  contractAddress: string,
  network: SupportedNetwork,
): Promise<CollectionStatistics> {
  switch (network) {
    case 'ethereum':
      return collectionStatsEthMainnet(contractAddress);
    case 'optimism':
      return collectionStatsOptimism(contractAddress);
    case 'rinkeby':
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
