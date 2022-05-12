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

  console.log({ json });

  return {
    floor: json?.stats?.floor_price || null,
    items: json?.stats?.total_supply || null,
    owners: json?.stats?.num_owners || null,
    volume: json?.stats?.total_volume || null,
  };
}
