import {
  connectorsForWallets,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { providers } from 'ethers';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import React, { PropsWithChildren, useMemo } from 'react';
import { WagmiProvider, chain, Chain } from 'wagmi';

const CHAINS: Chain[] = [
  { ...chain.rinkeby, name: 'Rinkeby' },
  { ...chain.mainnet, name: 'Ethereum' },
  { ...chain.optimism, name: 'Optimism' },
  { ...chain.polygonMainnet, name: 'Polygon' },
];

type ApplicationProvidersProps = {};
export const ApplicationProviders = ({
  children,
}: PropsWithChildren<ApplicationProvidersProps>) => {
  const { chainId, jsonRpcProvider, infuraId } = useConfig();

  const wallets = useMemo(() => {
    const w = getDefaultWallets({
      chains: CHAINS,
      appName: 'Backed',
      infuraId,
      jsonRpcUrl: jsonRpcProvider,
    });

    w[0].wallets.sort((a, b) => a.id.localeCompare(b.id));
    return w;
  }, [infuraId, jsonRpcProvider]);

  const connectors = useMemo(() => {
    return connectorsForWallets(wallets)({
      chainId,
    });
  }, [chainId, wallets]);

  const provider = useMemo(() => {
    return new providers.JsonRpcProvider(jsonRpcProvider);
  }, [jsonRpcProvider]);

  return (
    <GlobalMessagingProvider>
      <RainbowKitProvider theme={lightTheme()} chains={CHAINS}>
        <WagmiProvider autoConnect connectors={connectors} provider={provider}>
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
