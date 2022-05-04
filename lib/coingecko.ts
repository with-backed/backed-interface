import { config } from 'lib/config';

export async function getUnitPriceForCoin(
  tokenAddress: string,
  toCurrency: string,
): Promise<number | undefined> {
  // TODO: this is not a binary choice
  if (!config.onEthereumMainnet) {
    return 1.01;
  }

  const statsRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
  );

  const json = await statsRes.json();

  return json?.market_data?.current_price[toCurrency];
}
