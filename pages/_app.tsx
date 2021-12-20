import '../styles/global.css';
import '../public/fonts/maru/fonts-maru.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';

const getLibrary: React.ComponentProps<typeof Web3ReactProvider>['getLibrary'] =
  (provider) => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  };

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <TimestampProvider>
        <AppWrapper>
          <PawnShopHeader />
          <PageWrapper>
            <Component {...pageProps} />
          </PageWrapper>
        </AppWrapper>
      </TimestampProvider>
    </Web3ReactProvider>
  );
}
