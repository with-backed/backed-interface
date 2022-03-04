import React from 'react';
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
  injected: 'Metamask',
  walletLink: 'Coinbase Wallet',
  walletConnect: 'Wallet Connect',
};

const classNames: { [key: string]: string } = {
  injected: 'metamask',
  walletLink: 'coinbase-wallet',
  walletConnect: 'wallet-connect',
};

interface WalletButtonProps extends ButtonProps {
  wallet: string;
}
export function WalletButton({ wallet, onClick }: WalletButtonProps) {
  const Icon = icons[wallet] || icons.injected;
  const walletClass = classNames[wallet] || classNames.injected;
  const className = [styles['wallet-button'], styles[walletClass]].join(' ');
  return (
    <button className={className} onClick={onClick}>
      <div className={styles['button-grid-wrapper']}>
        <Icon />
        <p>{names[wallet]}</p>
      </div>
    </button>
  );
}
