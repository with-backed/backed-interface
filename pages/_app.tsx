import 'semantic-ui-css/semantic.min.css';
import '../styles/global.css';
import '../styles/ticketPage.css';
import '../styles/collateralCard.css';
import '../styles/underwriteCard.css';
import { AppProps } from 'next/app';
import { AccountProvider } from 'context/account';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AccountProvider>
      <Component {...pageProps} />
    </AccountProvider>
  );
}
