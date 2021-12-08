import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import styles from './ConnectWallet.module.css';
import { useWeb3 } from 'hooks/useWeb3';

import { InjectedConnector } from '@web3-react/injected-connector';

declare global {
  interface Window {
    ethereum: any;
  }
}

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '');
const supportedChainIds = [chainId];

type ExternalLinkProps = {
  href: string;
  display: React.ReactNode;
};
const ExternalLink = memo(function ExternalLink({
  display,
  href,
}: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {display}
    </a>
  );
});

const NoProvider = memo(function NoProvider() {
  const metamaskLink = (
    <ExternalLink href="https://metamask.io" display="Metamask" />
  );
  const chromeLink = (
    <ExternalLink href="https://www.google.com/chrome/" display="Chrome" />
  );
  return (
    <p>
      Please use {metamaskLink} + {chromeLink} to connect.
    </p>
  );
});

export const ConnectWallet = () => {
  const [providerAvailable, setProviderAvailable] = useState(false);
  const { account, activate } = useWeb3();

  const activateInjectedProvider = useCallback(async () => {
    if (window.ethereum) {
      if (process.env.NEXT_PUBLIC_ENV != 'local') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      }
    }
    const injectedConnector = new InjectedConnector({ supportedChainIds });
    activate(injectedConnector);
  }, [activate]);

  useEffect(() => {
    setProviderAvailable(!!window.ethereum);
  }, []);

  useEffect(() => {
    if (providerAvailable && !account) {
      window.ethereum.sendAsync(
        {
          method: 'eth_accounts',
          params: [],
          jsonrpc: '2.0',
          id: new Date().getTime(),
        },
        (error: any, result: any) => {
          if (error) {
            console.error(error);
          } else {
            const addressList = result.result;
            if (addressList && addressList.length > 0) {
              activateInjectedProvider();
            }
          }
        },
      );
    }
  }, [account, activateInjectedProvider, providerAvailable]);

  if (!providerAvailable) {
    return <NoProvider />;
  }

  if (!account) {
    return <Button onClick={activateInjectedProvider}>Connect Wallet</Button>;
  }

  return <div className={styles.connected}>👤 {account.slice(0, 7)}...</div>;
};
