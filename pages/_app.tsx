import 'styles/global.css';
import 'styles/fonts-maru.css';
import 'normalize.css';
import '@rainbow-me/rainbowkit/styles.css';
import { AppProps } from 'next/app';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { Footer } from 'components/Footer';
import { ConfigProvider } from 'hooks/useConfig';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SupportedNetwork, isSupportedNetwork } from 'lib/config';
import { ApplicationProviders } from 'components/ApplicationProviders';

export default function App({ Component, pageProps }: AppProps) {
  const { query } = useRouter();
  const [network, setNetwork] = useState<SupportedNetwork>(
    isSupportedNetwork(query.network as string)
      ? (query.network as SupportedNetwork)
      : 'ethereum',
  );

  useEffect(() => {
    if (query.network) {
      if (query.network !== network) {
        console.log({ network });
        if (isSupportedNetwork(query.network as string)) {
          setNetwork(query.network as SupportedNetwork);
        }
      }
    }
  }, [network, query.network]);

  console.log({ network, query });

  return (
    <ConfigProvider network={network}>
      <ApplicationProviders>
        <AppWrapper>
          <Component {...pageProps} />
          <Footer />
        </AppWrapper>
      </ApplicationProviders>
    </ConfigProvider>
  );
}
