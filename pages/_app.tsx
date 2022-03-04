import 'styles/global.css';
import 'styles/fonts-maru.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { useEffect, useState } from 'react';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { Provider } from 'wagmi';

const getLibrary: React.ComponentProps<typeof Web3ReactProvider>['getLibrary'] =
  (provider) => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  };

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
      <Provider>
        <Web3ReactProvider getLibrary={getLibrary}>
          <TimestampProvider>
            <AppWrapper>
              <PawnShopHeader prawn={showVariant} />
              <Component {...pageProps} />
            </AppWrapper>
          </TimestampProvider>
        </Web3ReactProvider>
      </Provider>
    </GlobalMessagingProvider>
  );
}
