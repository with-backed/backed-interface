import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
  DisclaimerComponent,
} from '@rainbow-me/rainbowkit';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { CommunityGradientProvider } from 'hooks/useCommunityGradient';
import { useConfig } from 'hooks/useConfig';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import React, { PropsWithChildren, useMemo } from 'react';
import { WagmiConfig, chain, createClient, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

const prodChains = [chain.mainnet, chain.polygon, chain.optimism];
const CHAINS =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? prodChains
    : [...prodChains, chain.rinkeby];

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

type ApplicationProvidersProps = {};
export const ApplicationProviders = ({
  children,
}: PropsWithChildren<ApplicationProvidersProps>) => {
  const { infuraId, alchemyId, network } = useConfig();
  const orderedChains = useMemo(() => {
    const thisChain = CHAINS.find((c) => c.name.toLowerCase() === network)!;
    return [thisChain, ...CHAINS];
  }, [network]);

  const { provider, chains } = useMemo(
    () =>
      configureChains(orderedChains, [
        alchemyProvider({ alchemyId }),
        infuraProvider({ infuraId }),
        publicProvider(),
      ]),
    [alchemyId, infuraId, orderedChains],
  );

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
                <CommunityGradientProvider>
                  {children}
                </CommunityGradientProvider>
              </HasCollapsedHeaderInfoProvider>
            </CachedRatesProvider>
          </TimestampProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </GlobalMessagingProvider>
  );
};
