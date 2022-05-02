import { mainnet, optimism, rinkeby } from 'lib/chainEnv';
import { collectionStatsEthMainnet } from 'lib/nftCollectionStats/nftPort';
import { collectionStatsOptimism } from 'lib/nftCollectionStats/quixotic';
import {
  getFakeFloor,
  getFakeItemsAndOwners,
  getFakeVolume,
} from 'lib/nftCollectionStats/mockData';

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
      const [items, owners] = getFakeItemsAndOwners();
      return {
        floor: getFakeFloor(),
        items,
        owners,
        volume: getFakeVolume(),
      };
    default:
      return {
        floor: null,
        items: null,
        owners: null,
        volume: null,
      };
  }
}
