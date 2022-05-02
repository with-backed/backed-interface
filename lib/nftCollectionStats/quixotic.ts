import { CollectionStatistics } from 'lib/nftCollectionStats';

export async function collectionStatsOptimism(
  contractAddress: string,
): Promise<CollectionStatistics> {
  const quixoticAssetReq = await fetch(
    `https://api.quixotic.io/api/v1/opt/collection/${contractAddress}/stats`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.QUIXOTIC_API_KEY!,
      }),
    },
  );

  const json = (await quixoticAssetReq.json()) as any;

  return {
    floor: json?.stats?.floor_price,
    items: json?.stats?.total_supply,
    owners: json?.stats?.num_owners,
    volume: json?.stats?.total_volume,
  };
}
