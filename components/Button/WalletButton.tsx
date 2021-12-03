import React from 'react';
import styles from './Button.module.css';

import { CoinbaseWallet } from 'components/Icons/CoinbaseWallet';
import { Metamask } from 'components/Icons/Metamask';
import { WalletConnect } from 'components/Icons/WalletConnect';
import { ButtonProps } from './Button';

type SupportedWallet = 'Metamask' | 'Coinbase Wallet' | 'Wallet Connect';

const icons: { [key in SupportedWallet]: () => JSX.Element } = {
  Metamask: Metamask,
  'Coinbase Wallet': CoinbaseWallet,
  'Wallet Connect': WalletConnect,
};

interface WalletButtonProps extends ButtonProps {
  wallet: SupportedWallet;
}
export function WalletButton({ wallet, onClick }: WalletButtonProps) {
  const Icon = icons[wallet];
  return (
    <button className={styles['wallet-button']} onClick={onClick}>
      <div className={styles['button-grid-wrapper']}>
        <Icon />
        <p>{wallet}</p>
      </div>
    </button>
  );
}
