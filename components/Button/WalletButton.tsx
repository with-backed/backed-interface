import React from 'react';
import styles from './Button.module.css';

import { CoinbaseWallet } from 'components/Icons/CoinbaseWallet';
import { Metamask } from 'components/Icons/Metamask';
import { WalletConnect } from 'components/Icons/WalletConnect';
import { ButtonProps } from './Button';

type SupportedWallet = 'MetaMask' | 'Coinbase Wallet' | 'Wallet Connect';

const icons: { [key in SupportedWallet]: () => JSX.Element } = {
  MetaMask: Metamask,
  'Coinbase Wallet': CoinbaseWallet,
  'Wallet Connect': WalletConnect,
};

const classNames: { [key in SupportedWallet]: string } = {
  MetaMask: 'metamask',
  'Coinbase Wallet': 'coinbase-wallet',
  'Wallet Connect': 'wallet-connect',
};

interface WalletButtonProps extends ButtonProps {
  wallet: SupportedWallet;
}
export function WalletButton({ wallet, onClick }: WalletButtonProps) {
  const Icon = icons[wallet];
  const walletClass = classNames[wallet];
  const className = [styles['wallet-button'], styles[walletClass]].join(' ');
  return (
    <button className={className} onClick={onClick}>
      <div className={styles['button-grid-wrapper']}>
        <Icon />
        <p>{wallet}</p>
      </div>
    </button>
  );
}
