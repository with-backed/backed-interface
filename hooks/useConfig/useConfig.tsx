import { Config, configs, SupportedNetwork } from 'lib/config';
import { createContext, FunctionComponent, useContext } from 'react';

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
  return config!;
}
