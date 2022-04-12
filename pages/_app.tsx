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
import { AppWrapper } from 'components/layouts/AppWrapper';
import { providers } from 'ethers';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { WagmiProvider, chain } from 'wagmi';
import Head from 'next/head';

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalMessagingProvider>
      <RainbowKitProvider theme={lightTheme()} chains={chains}>
        <WagmiProvider
          autoConnect
          connectors={connectors}
          provider={jsonRpcProvider}>
          <TimestampProvider>
            <AppWrapper>
              <Head>
                <link
                  rel="preload"
                  href="/fonts/maru/GT-Maru-Regular-Trial.woff2"
                  as="font"
                  type="font/woff2"
                />
                <link
                  rel="preload"
                  href="/fonts/maru/GT-Maru-Light-Trial.woff2"
                  as="font"
                  type="font/woff2"
                />
                <link
                  rel="preload"
                  href="/fonts/maru/GT-Maru-Mono-Regular-Trial.woff2"
                  as="font"
                  type="font/woff2"
                />
                <link
                  rel="preload"
                  href="/fonts/maru/GT-Maru-Mono-Regular-Oblique-Trial.woff2"
                  as="font"
                  type="font/woff2"
                />
                <link
                  rel="preload"
                  href="/fonts/maru/GT-Maru-Mono-Bold-Trial.woff2"
                  as="font"
                  type="font/woff2"
                />
              </Head>
              <Component {...pageProps} />
            </AppWrapper>
          </TimestampProvider>
        </WagmiProvider>
      </RainbowKitProvider>
    </GlobalMessagingProvider>
  );
}
