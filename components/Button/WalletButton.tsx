import React, { useCallback, useEffect, useState } from 'react';
import styles from './Button.module.css';

import { CoinbaseWallet } from 'components/Icons/CoinbaseWallet';
import { Metamask } from 'components/Icons/Metamask';
import { WalletConnect } from 'components/Icons/WalletConnect';
import { ButtonProps } from './Button';

const icons: { [key: string]: () => JSX.Element } = {
  injected: Metamask,
  walletLink: CoinbaseWallet,
  walletConnect: WalletConnect,
};

const names: { [key: string]: string } = {
  injected: 'MetaMask',
  walletLink: 'Coinbase Wallet',
  walletConnect: 'Wallet Connect',
};

const classNames: { [key: string]: string } = {
  injected: 'metamask',
  walletLink: 'coinbase-wallet',
  walletConnect: 'wallet-connect',
};

const visitMetaMask = () => {
  window.open('https://metamask.io', '_blank');
};

interface WalletButtonProps extends ButtonProps {
  wallet: string;
}
export function WalletButton({ wallet, onClick }: WalletButtonProps) {
  const [providerAvailable, setProviderAvailable] = useState(false);
  const Icon = icons[wallet] || icons.injected;
  const walletClass = classNames[wallet] || classNames.injected;
  const className = [styles['wallet-button'], styles[walletClass]].join(' ');

  useEffect(() => {
    if (window.ethereum) {
      setProviderAvailable(true);
    }
  }, [setProviderAvailable]);

  return (
    <button
      className={className}
      onClick={
        wallet === 'injected' && !providerAvailable ? visitMetaMask : onClick
      }>
      <div className={styles['button-grid-wrapper']}>
        <Icon />
        <p>{names[wallet]}</p>
      </div>
    </button>
  );
}
