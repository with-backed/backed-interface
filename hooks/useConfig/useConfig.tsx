import { Config, configs, SupportedNetwork } from 'lib/config';
import { useRouter } from 'next/router';
import { createContext, FunctionComponent, useContext, useMemo } from 'react';

const ConfigContext = createContext<Config | null>(null);

type ConfigProviderProps = {
  network: SupportedNetwork;
};
export const ConfigProvider: FunctionComponent<ConfigProviderProps> = ({
  children,
  network,
}) => {
  return (
    <ConfigContext.Provider value={configs[network]}>
      {children}
    </ConfigContext.Provider>
  );
};

export function useConfig(): Config {
  const config = useContext(ConfigContext);
  const { pathname } = useRouter();
  const isCommunityPage = useMemo(
    () => pathname.startsWith('/community'),
    [pathname],
  );

  if (isCommunityPage) {
    return configs.optimism;
  }

  return config!;
}
