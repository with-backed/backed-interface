import { CollectionStatistics } from 'lib/nftCollectionStats';

const reservoirResToStats = (json: any): CollectionStatistics => ({
  floor: json?.collection?.floorAsk.price || null,
  items: json?.collection?.tokenCount || null,
  owners: json?.collection?.ownerCount || null,
  volume: json?.collection?.volume.allTime || null,
});

export async function collectionStatsEthMainnet(
  contractAddress: string,
  tokenId: string,
): Promise<CollectionStatistics> {
  const tokensV4Req = await fetch(
    `https://api.reservoir.tools/tokens/v4?tokens=${contractAddress}:${tokenId}`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.RESERVOIR_API_KEY!,
      }),
    },
  );

  const collectionId = (await tokensV4Req.json())?.tokens[0]?.collection?.id;

  const collectionV2Req = await fetch(
    `https://api.reservoir.tools/collection/v2?id=${collectionId}`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.RESERVOIR_API_KEY!,
      }),
    },
  );

  return reservoirResToStats(await collectionV2Req.json());
}
