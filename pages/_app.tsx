import '../styles/global.css';
import 'normalize.css';
import { AppProps } from 'next/app';
import { AccountProvider } from 'context/account';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AccountProvider>
      <Component {...pageProps} />
    </AccountProvider>
  );
}
