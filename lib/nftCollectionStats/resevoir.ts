import { CollectionStatistics } from 'lib/nftCollectionStats';

export async function collectionStatsEthMainnet(
  contractAddress: string,
): Promise<CollectionStatistics> {
  const resevoirAssetReq = await fetch(
    `https://api.reservoir.tools/collection/v2?id=${contractAddress}`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.RESEVOIR_API_KEY!,
      }),
    },
  );

  const json = (await resevoirAssetReq.json()) as any;

  return {
    floor: json?.collection?.floorAsk.price,
    items: json?.collection?.tokenCount,
    owners: json?.collection?.ownerCount,
    volume: json?.collection?.volume.allTime,
  };
}
