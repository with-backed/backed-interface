import { getUnitPriceForCoin } from 'lib/coingecko';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type CurrentCachedRates = {
  [key: string]: {
    nominal: number;
    expiry: number;
  };
};

type CachedRatesAccessor = {
  getRate: (erc20Address: string, fiat: string) => Promise<number | null>;
};

export const CachedRatesContext = createContext<CachedRatesAccessor>({
  getRate: async () => null,
});

export function CachedRatesProvider({ children }: PropsWithChildren<{}>) {
  const [rateCache, setRateCache] = useState<CurrentCachedRates>({});
  const setKeyValueForCache = useCallback(
    (newKey: string, newValue: { nominal: number; expiry: number }) => {
      setRateCache((prevRateCache: CurrentCachedRates) => ({
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
    <CachedRatesContext.Provider value={{ getRate }}>
      {children}
    </CachedRatesContext.Provider>
  );
}

export function useCachedRates() {
  const ratesCache = useContext(CachedRatesContext);
  return ratesCache;
}
