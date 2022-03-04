import 'styles/global.css';
import 'styles/fonts-maru.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { useEffect, useState } from 'react';
import { Provider } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { WalletLinkConnector } from 'wagmi/connectors/walletLink';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';

const jsonRpcUrl = process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER || '';

const connectors = [
  new InjectedConnector({
    options: { shimDisconnect: true },
  }),
  new WalletConnectConnector({
    options: {
      qrcode: true,
    },
  }),
  new WalletLinkConnector({
    options: {
      appName: 'NFT Pawn Shop',
      jsonRpcUrl,
    },
  }),
];

const konami = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
  'Enter',
];
let konamiIndex = 0;

export default function App({ Component, pageProps }: AppProps) {
  const [showVariant, setShowVariant] = useState(false);
  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent) {
      if (ev.code === konami[konamiIndex]) {
        ++konamiIndex;
      } else {
        konamiIndex = 0;
      }

      if (konamiIndex >= konami.length) {
        konamiIndex = 0;
        setShowVariant((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <GlobalMessagingProvider>
      <Provider autoConnect connectors={connectors}>
        <TimestampProvider>
          <AppWrapper>
            <PawnShopHeader prawn={showVariant} />
            <Component {...pageProps} />
          </AppWrapper>
        </TimestampProvider>
      </Provider>
    </GlobalMessagingProvider>
  );
}
