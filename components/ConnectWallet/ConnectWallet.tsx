import React, { memo, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from 'components/Button';
import styles from './ConnectWallet.module.css';
import { useWeb3 } from 'hooks/useWeb3';

declare global {
  interface Window {
    ethereum: any;
  }
}

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
  const { account } = useWeb3();
  const [providerAvailable, setProviderAvailable] = useState(false);

  const getAccount = useCallback(async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (process.env.NEXT_PUBLIC_ENV != 'local') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: process.env.NEXT_PUBLIC_CHAIN_ID }],
      });
    }
    let account = ethers.utils.getAddress(accounts[0]);
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      account = ethers.utils.getAddress(accounts[0]);
    });
  }, []);

  const setup = useCallback(async () => {
    if (window.ethereum == null) {
      setProviderAvailable(false);
      return;
    }
    setProviderAvailable(true);
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  if (!providerAvailable) {
    return <NoProvider />;
  }

  if (!account) {
    return <Button onClick={getAccount}>Connect Wallet</Button>;
  }

  return <div className={styles.connected}>👤 {account.slice(0, 7)}...</div>;
};
