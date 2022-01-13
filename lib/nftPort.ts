export async function getNFTFloor(contractAddress: string): Promise<number> {
  const headers = new Headers({
    Authorization: `${process.env.NEXT_PUBLIC_NFT_PORT_API_KEY}`,
    'Content-Type': 'application/json',
  });

  const floorRes = await fetch(
    `https://api.nftport.xyz/v0/transactions/stats/${contractAddress}?chain=ethereum`,
    {
      headers,
    },
  );
  const floorResJson: any = await floorRes.json();

  return floorResJson.statistics?.floor_price;
}

// MOCK METHODS TO GENERATE FAKE STATS FOR RINKEBY

export function getFakeFloor(): number {
  return Math.floor(Math.random() * (20 + 1));
}
