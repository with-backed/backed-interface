import '../styles/global.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { AccountProvider } from 'context/account';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

const getLibrary: React.ComponentProps<typeof Web3ReactProvider>['getLibrary'] =
  (provider) => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  };

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AccountProvider>
        <Component {...pageProps} />
      </AccountProvider>
    </Web3ReactProvider>
  );
}
