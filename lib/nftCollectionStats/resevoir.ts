import { CollectionStatistics } from 'lib/nftCollectionStats';

const ART_BLOCKS_CONTRACT_ADDRESS =
  '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270';

const resevoirResToStats = (json: any): CollectionStatistics => ({
  floor: json?.collection?.floorAsk.price,
  items: json?.collection?.tokenCount,
  owners: json?.collection?.ownerCount,
  volume: json?.collection?.volume.allTime,
});

export async function collectionStatsEthMainnet(
  contractAddress: string,
  tokenId: string,
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

  if (contractAddress === ART_BLOCKS_CONTRACT_ADDRESS) {
    return handleArtBlocks(tokenId);
  }

  return resevoirResToStats(await resevoirAssetReq.json());
}

async function handleArtBlocks(tokenId: string): Promise<CollectionStatistics> {
  const tokensV4Req = await fetch(
    `https://api.reservoir.tools/tokens/v4?tokens=${ART_BLOCKS_CONTRACT_ADDRESS}:${tokenId}`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.RESEVOIR_API_KEY!,
      }),
    },
  );

  const collectionId = (await tokensV4Req.json()).tokens[0].collection.id;

  const collectionV2Req = await fetch(
    `https://api.reservoir.tools/collection/v2?id=${collectionId}`,
    {
      headers: new Headers({
        Accept: 'application/json',
        'x-api-key': process.env.RESEVOIR_API_KEY!,
      }),
    },
  );

  return resevoirResToStats(await collectionV2Req.json());
}
