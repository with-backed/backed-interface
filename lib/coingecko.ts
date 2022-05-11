import { SupportedNetwork } from './config';

export async function getUnitPriceForCoin(
  tokenAddress: string,
  toCurrency: string,
  network?: SupportedNetwork,
): Promise<number | undefined> {
  if (network === 'rinkeby') {
    return 1.01;
  }

  if (network === 'ethereum') {
    const statsRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
    );

    const json = await statsRes.json();

    return json?.market_data?.current_price[toCurrency];
  }

  // unhandled network
  return undefined;
}
