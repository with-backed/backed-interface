import { captureException } from '@sentry/nextjs';
import { SupportedNetwork } from './config';

// based on output from https://api.coingecko.com/api/v3/asset_platforms
const networkMap = {
  optimism: 'optimistic-ethereum',
  ethereum: 'ethereum',
  polygon: 'polygon-pos',
};

export async function getUnitPriceForEth(toCurrency: string) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${toCurrency}`,
    );
    const json = await res.json();

    if (json) {
      return json.ethereum[toCurrency] as number | undefined;
    }
  } catch (e) {
    captureException(e);
  }
  return undefined;
}

export async function getUnitPriceForCoin(
  tokenAddress: string,
  toCurrency: string,
  network?: SupportedNetwork,
): Promise<number | undefined> {
  if (network === 'rinkeby') {
    return 1.01;
  }

  if (network && networkMap[network]) {
    const statsRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${networkMap[network]}/contract/${tokenAddress}`,
    );

    const json = await statsRes.json();

    return json?.market_data?.current_price[toCurrency];
  }

  // unhandled network
  return undefined;
}
