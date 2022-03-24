import '../styles/global.css';
import '../styles/fonts-maru.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';

const getLibrary: React.ComponentProps<typeof Web3ReactProvider>['getLibrary'] =
  (provider) => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  };

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalMessagingProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <TimestampProvider>
          <AppWrapper>
            <PawnShopHeader />
            <Component {...pageProps} />
          </AppWrapper>
        </TimestampProvider>
      </Web3ReactProvider>
    </GlobalMessagingProvider>
  );
}
