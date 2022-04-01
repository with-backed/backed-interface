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
  Theme,
} from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { providers } from 'ethers';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { WagmiProvider, chain } from 'wagmi';

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

const defaultTheme = lightTheme();
const customTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    connectButtonText: 'var(--highlight-clickable-100)',
    connectButtonInnerBackground: `linear-gradient(
      180deg,
      var(--highlight-clickable-5) 50%,
      var(--highlight-clickable-7) 100%
    )`,
  },
  fonts: {
    body: 'var(--sans)',
  },
  shadows: {
    ...defaultTheme.shadows,
    connectButton: 'none',
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalMessagingProvider>
      <RainbowKitProvider theme={customTheme} chains={chains}>
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
  );
}
