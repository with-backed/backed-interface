import { CollectionStatistics } from 'lib/nftCollectionStats';

export async function collectionStatsPolygon(
  contractAddress: string,
): Promise<CollectionStatistics> {
  const headers = new Headers({
    Authorization: `${process.env.NFT_PORT_API_KEY}`,
    'Content-Type': 'application/json',
  });

  const statsRes = await fetch(
    `https://api.nftport.xyz/v0/transactions/stats/${contractAddress}?chain=polygon`,
    {
      headers,
    },
  );
  const statsResJson: any = await statsRes.json();

  return {
    floor: statsResJson.statistics?.floor_price || null,
    items: statsResJson.statistics?.total_supply || null,
    owners: statsResJson.statistics?.num_owners || null,
    volume: statsResJson.statistics?.total_volume || null,
  };
}
