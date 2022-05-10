import { SupportedNetwork } from './config';

export async function getUnitPriceForCoin(
  tokenAddress: string,
  toCurrency: string,
  network: SupportedNetwork,
): Promise<number | undefined> {
  if (network !== 'ethereum') {
    return undefined;
  }

  const statsRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
  );

  const json = await statsRes.json();

  return json?.market_data?.current_price[toCurrency];
}
