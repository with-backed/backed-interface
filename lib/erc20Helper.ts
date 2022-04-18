import { getUnitPriceForCoin } from './coingecko';

export type ERC20Amount = {
  nominal: string;
  symbol: string;
  address: string;
};

export type CurrentRatesCache = {
  [key: string]: {
    nominal: number;
    expiry: number;
  };
};

export async function convertERC20ToCurrency(
  amounts: ERC20Amount[],
  currency: string,
  cache: CurrentRatesCache,
  setKeyValueForCache: (
    newKey: string,
    newValue: { nominal: number; expiry: number },
  ) => void,
): Promise<number | null> {
  let total = 0;
  for (let i = 0; i < amounts.length; i++) {
    const cacheKey = `${amounts[i].address}:${currency}`;
    const now = Math.floor(new Date().getTime() / 1000);
    let rate: number | undefined;

    if (cache[cacheKey] && now < cache[cacheKey].expiry) {
      rate = cache[cacheKey].nominal;
    } else {
      rate = await getUnitPriceForCoin(amounts[i].address, currency);

      if (!rate) return null;

      setKeyValueForCache(cacheKey, {
        nominal: rate,
        expiry: now + 120, // 2 min expiry
      });
    }

    total += parseFloat(amounts[i].nominal) * rate;
  }
  return total;
}
