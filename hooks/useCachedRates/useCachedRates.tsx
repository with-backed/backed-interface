import { useConfig } from 'hooks/useConfig';
import { getUnitPriceForCoin, getUnitPriceForEth } from 'lib/coingecko';
import { SupportedNetwork } from 'lib/config';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
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
  getEthRate: (toCurrency: string) => Promise<number | null>;
};

export const CachedRatesContext = createContext<CachedRatesAccessor>({
  getRate: async () => null,
  getEthRate: async () => null,
});

export function CachedRatesProvider({ children }: PropsWithChildren<{}>) {
  const { network } = useConfig();
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
        rate = await getUnitPriceForCoin(
          erc20Address,
          fiat,
          network as SupportedNetwork,
        );

        if (!rate) return null;

        setKeyValueForCache(key, {
          nominal: rate,
          expiry: now + 120, // 2 min expiry
        });
      }
      return rate;
    },
    [network, rateCache, setKeyValueForCache],
  );

  const getEthRate = useCallback(
    async (toCurrency: string) => {
      const key = `eth:${toCurrency}`;
      let rate: number | undefined;
      const now = Math.floor(new Date().getTime() / 1000);
      if (rateCache[key] && now < rateCache[key].expiry) {
        rate = rateCache[key].nominal;
      } else {
        rate = await getUnitPriceForEth(toCurrency);

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
    <CachedRatesContext.Provider value={{ getRate, getEthRate }}>
      {children}
    </CachedRatesContext.Provider>
  );
}

export function useCachedRates() {
  const ratesCache = useContext(CachedRatesContext);
  return ratesCache;
}
