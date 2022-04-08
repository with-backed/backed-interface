import 'styles/global.css';
import 'styles/fonts-maru.css';
import 'normalize.css';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  Chain,
  getDefaultWallets,
  connectorsForWallets,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { providers } from 'ethers';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { WagmiProvider, chain } from 'wagmi';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';

Bugsnag.start({
  apiKey: '14558dbf2fab438a64debb70104edc45',
  plugins: [new BugsnagPluginReact()],
});

const jsonRpcProvider = new providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

const chains: Chain[] = [{ ...chain.rinkeby, name: 'Rinkeby' }];

const wallets = getDefaultWallets({
  chains,
  appName: 'Backed',
  jsonRpcUrl: ({ chainId }) =>
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0],
});

const connectors = connectorsForWallets(wallets)({
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
});

const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <GlobalMessagingProvider>
        <RainbowKitProvider theme={lightTheme()} chains={chains}>
          <WagmiProvider
            autoConnect
            connectors={connectors}
            provider={jsonRpcProvider}>
            <TimestampProvider>
              <AppWrapper>
                <PawnShopHeader />
                <Component {...pageProps} />
              </AppWrapper>
            </TimestampProvider>
          </WagmiProvider>
        </RainbowKitProvider>
      </GlobalMessagingProvider>
    </ErrorBoundary>
  );
}
