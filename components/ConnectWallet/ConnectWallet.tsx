import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, ButtonLink } from 'components/Button';
import { DisplayAddress } from 'components/DisplayAddress';
import React from 'react';
import styles from './ConnectWallet.module.css';

export const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal }) =>
        !account ? (
          <Button onClick={openConnectModal} type="button">
            🥕 Connect
          </Button>
        ) : (
          <ButtonLink href={`/profile/${account.address}`} kind="secondary">
            <span className={styles.address}>
              🔓 <DisplayAddress address={account.address} />
            </span>
          </ButtonLink>
        )
      }
    </ConnectButton.Custom>
  );
};
