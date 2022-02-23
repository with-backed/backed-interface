import { mainnet } from './chainEnv';

export async function getUnitPriceForCoin(
  tokenAddress: string,
): Promise<number> {
  if (!mainnet()) {
    return 1.01;
  }

  const statsRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
  );

  const json = await statsRes.json();

  return json?.market_data?.current_price?.usd;
}
