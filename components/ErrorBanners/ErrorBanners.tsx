import { Banner } from 'components/Banner';
import { WrongNetwork } from 'components/Banner/messages';
import { useConfig } from 'hooks/useConfig';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { configs, SupportedNetwork } from 'lib/config';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styles from './ErrorBanners.module.css';

export function ErrorBanners() {
  const { chainId, network } = useConfig();
  const { messages, removeMessage } = useGlobalMessages();
  const { pathname } = useRouter();
  const isErrorPage = useMemo(
    () => pathname === '/404' || pathname === '/500',
    [pathname],
  );
  const isAboutPage = useMemo(() => pathname === '/about', [pathname]);
  const isCommunityPage = useMemo(() => pathname === '/community', [pathname]);

  return (
    <div className={styles.banners}>
      {!isErrorPage && !isCommunityPage && !isAboutPage && (
        <WrongNetwork
          expectedChainId={chainId}
          expectedChainName={network as SupportedNetwork}
        />
      )}
      {isCommunityPage && (
        /* Community page is not network-namespaced and only works on Optimism */
        <WrongNetwork
          expectedChainId={configs.optimism.chainId}
          expectedChainName={configs.optimism.network as SupportedNetwork}
        />
      )}
      {messages.map((m) => {
        const close = () => removeMessage(m);
        return (
          // It's possible for a ReactNode to be null, but `message` shouldn't be on a banner.
          <Banner key={m.message as any} kind={m.kind} close={close}>
            {m.message}
          </Banner>
        );
      })}
    </div>
  );
}
