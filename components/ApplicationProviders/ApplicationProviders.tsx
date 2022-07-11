import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
  DisclaimerComponent,
} from '@rainbow-me/rainbowkit';
import { ChainName } from '@wagmi/core/dist/declarations/src/constants/chains';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import React, { PropsWithChildren, useMemo } from 'react';
import { WagmiConfig, chain, createClient, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{' '}
    <Link href="/legal/terms-of-service.pdf">Backed Terms of Service</Link> and
    acknowledge you have read and understand the{' '}
    <Link href="https://github.com/with-backed/backed-protocol/blob/master/README.md#disclaimer">
      Backed protocol disclaimer
    </Link>
    .
  </Text>
);

const CHAINS = [chain.rinkeby, chain.mainnet, chain.polygon, chain.optimism];

type ApplicationProvidersProps = {};
export const ApplicationProviders = ({
  children,
}: PropsWithChildren<ApplicationProvidersProps>) => {
  const { infuraId, alchemyId, network } = useConfig();

  const { provider, chains } = useMemo(() => {
    const c = chain[network as ChainName];
    return configureChains(c ? [c] : CHAINS, [
      alchemyProvider({ alchemyId }),
      infuraProvider({ infuraId }),
      publicProvider(),
    ]);
  }, [alchemyId, infuraId, network]);

  const { connectors } = useMemo(
    () =>
      getDefaultWallets({
        appName: 'Backed',
        chains,
      }),
    [chains],
  );

  const client = useMemo(() => {
    return createClient({
      autoConnect: true,
      connectors,
      provider,
    });
  }, [connectors, provider]);

  return (
    <GlobalMessagingProvider>
      <WagmiConfig client={client}>
        <RainbowKitProvider
          theme={lightTheme()}
          chains={chains}
          appInfo={{
            appName: 'Backed',
            disclaimer: Disclaimer,
          }}>
          <TimestampProvider>
            <CachedRatesProvider>
              <HasCollapsedHeaderInfoProvider>
                {children}
              </HasCollapsedHeaderInfoProvider>
            </CachedRatesProvider>
          </TimestampProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </GlobalMessagingProvider>
  );
};
