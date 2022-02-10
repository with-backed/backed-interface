import { ethers } from 'ethers';
import { mainnet } from './chainEnv';

async function getUnitPriceForCoin(tokenAddress: string): Promise<number> {
  if (!mainnet()) {
    return Math.random();
  }

  const headers = new Headers({
    Authorization: `${process.env.NEXT_PUBLIC_NFT_PORT_API_KEY}`,
    'Content-Type': 'application/json',
  });

  const statsRes = await fetch(
    `https://api.nftport.xyz/v0/transactions/stats/${contractAddress}?chain=ethereum`,
    {
      headers,
    },
  );
}
