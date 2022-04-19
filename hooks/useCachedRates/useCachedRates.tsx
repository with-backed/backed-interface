import { getUnitPriceForCoin } from 'lib/coingecko';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type CurrentRatesCache = {
  [key: string]: {
    nominal: number;
    expiry: number;
  };
};

type RatesCacheAccessor = {
  getRate: (erc20Address: string, fiat: string) => Promise<number | null>;
};

export const RatesCacheContext = createContext<RatesCacheAccessor>({
  getRate: async () => null,
});

export function CachedRatesProvider({ children }: PropsWithChildren<{}>) {
  const [rateCache, setRateCache] = useState<CurrentRatesCache>({});
  const setKeyValueForCache = useCallback(
    (newKey: string, newValue: { nominal: number; expiry: number }) => {
      setRateCache((prevRateCache: CurrentRatesCache) => ({
        ...prevRateCache,
        [newKey]: newValue,
      }));
    },
    [setRateCache],
  );

  const getRate = useCallback(
    async (erc20Address: string, fiat: string) => {
      const key = `${erc20Address}:${fiat}`;
      let rate: number | undefined;
      const now = Math.floor(new Date().getTime() / 1000);

      if (rateCache[key] && now < rateCache[key].expiry) {
        rate = rateCache[key].nominal;
      } else {
        rate = await getUnitPriceForCoin(erc20Address, fiat);

        if (!rate) return null;

        setKeyValueForCache(key, {
          nominal: rate,
          expiry: now + 120, // 2 min expiry
        });
      }
      return rate;
    },
    [rateCache, setKeyValueForCache],
  );

  return (
    <RatesCacheContext.Provider value={{ getRate }}>
      {children}
    </RatesCacheContext.Provider>
  );
}

export function useCachedRates() {
  const ratesCache = useContext(RatesCacheContext);
  return ratesCache;
}
