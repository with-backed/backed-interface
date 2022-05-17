import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { captureMessage } from '@sentry/nextjs';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { configs } from 'lib/config';
import React, { PropsWithChildren, useMemo } from 'react';
import { WagmiProvider, chain, Chain, createClient } from 'wagmi';

const CHAINS: Chain[] = [
  { ...chain.rinkeby, name: 'Rinkeby' },
  { ...chain.mainnet, name: 'Ethereum' },
  { ...chain.optimism, name: 'Optimism' },
  { ...chain.polygon, name: 'Polygon' },
];

type ApplicationProvidersProps = {};
export const ApplicationProviders = ({
  children,
}: PropsWithChildren<ApplicationProvidersProps>) => {
  const { infuraId, jsonRpcProvider } = useConfig();

  const { provider, chains } = configureChains(CHAINS, [
    apiProvider.jsonRpc((chain) => {
      for (let config of Object.values(configs)) {
        if (config.chainId === chain.id) {
          return { rpcUrl: jsonRpcProvider };
        }
      }
      // We didn't find the correct RPC provider in our allowed configs. User on a network we don't support?
      captureMessage(
        `Cannot get jsonRpcProvider for chainId: ${chain.id}. User on a network we don't support?`,
      );
      return { rpcUrl: '' };
    }),
    apiProvider.infura(infuraId),
    apiProvider.fallback(),
  ]);

  const { connectors } = getDefaultWallets({
    appName: 'Backed',
    chains,
  });

  const client = useMemo(() => {
    return createClient({
      autoConnect: true,
      connectors,
      provider,
    });
  }, [connectors, provider]);

  return (
    <GlobalMessagingProvider>
      <RainbowKitProvider theme={lightTheme()} chains={chains}>
        <WagmiProvider client={client}>
          <TimestampProvider>
            <CachedRatesProvider>
              <HasCollapsedHeaderInfoProvider>
                {children}
              </HasCollapsedHeaderInfoProvider>
            </CachedRatesProvider>
          </TimestampProvider>
        </WagmiProvider>
      </RainbowKitProvider>
    </GlobalMessagingProvider>
  );
};
