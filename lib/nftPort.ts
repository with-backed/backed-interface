export type CollectionStatistics = {
  floor: number;
  items: number;
  owners: number;
  volume: number;
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
    floor: statsResJson.statistics?.floor_price || 0,
    items: statsResJson.statistics?.total_supply || 0,
    owners: statsResJson.statistics?.num_owners || 0,
    volume: statsResJson.statistics?.total_volume || 0,
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
