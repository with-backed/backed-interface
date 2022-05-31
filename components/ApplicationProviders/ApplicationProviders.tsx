import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
  DisclaimerComponent,
} from '@rainbow-me/rainbowkit';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import React, { PropsWithChildren, useMemo } from 'react';
import {
  WagmiConfig,
  chain,
  Chain,
  createClient,
  configureChains,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

const CHAINS: Chain[] = [
  { ...chain.rinkeby, name: 'Rinkeby' },
  { ...chain.mainnet, name: 'Ethereum' },
  { ...chain.optimism, name: 'Optimism' },
  { ...chain.polygon, name: 'Polygon' },
];

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{' '}
    <Link href="/legal/terms-of-service.pdf">Terms of Service</Link> and
    acknowledge you have read and understand the{' '}
    <Link href="/legal/privacy-policy.pdf">Privacy Policy</Link>
  </Text>
);

type ApplicationProvidersProps = {};
export const ApplicationProviders = ({
  children,
}: PropsWithChildren<ApplicationProvidersProps>) => {
  const { infuraId, alchemyId } = useConfig();

  const { provider, chains } = configureChains(CHAINS, [
    alchemyProvider({ alchemyId }),
    infuraProvider({ infuraId }),
    publicProvider(),
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
