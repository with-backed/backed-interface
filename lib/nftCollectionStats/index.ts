import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/reservoir';
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
  tokenId: string,
  network: SupportedNetwork,
): Promise<CollectionStatistics> {
  switch (network) {
    case 'ethereum':
      return collectionStatsEthMainnet(contractAddress, tokenId);
    case 'optimism':
      // quixotic api broke
      return nullCollectionStats;
    case 'polygon':
      return nullCollectionStats;
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
