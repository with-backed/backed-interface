export type CollectionStatistics = {
  floor: number | null;
  items: number | null;
  owners: number | null;
  volume: number | null;
};

export async function collectionStats(
  contractAddress: string,
): Promise<CollectionStatistics> {
  const headers = new Headers({
    Authorization: `${process.env.NFT_PORT_API_KEY}`,
    'Content-Type': 'application/json',
  });

  const statsRes = await fetch(
    `https://api.nftport.xyz/v0/transactions/stats/${contractAddress}?chain=ethereum`,
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

// MOCK METHODS TO GENERATE FAKE STATS FOR RINKEBY

export function getFakeFloor(): number {
  return Math.floor(Math.random() * (20 + 1));
}

export function getFakeItemsAndOwners(): [number, number] {
  const items = Math.floor(Math.random() * 800);
  const owners = Math.floor(Math.random() * (items - 1));

  return [items, owners];
}

export function getFakeVolume(): number {
  return Math.floor(Math.random() * 2000);
}
