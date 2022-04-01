import React, { useEffect } from 'react';
import { useDialogState } from 'reakit/Dialog';
import { ConnectedWalletMenu } from './ConnectedWalletMenu';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const ConnectWallet = () => {
  const [{ data: accountData }] = useAccount();
  const dialog = useDialogState();

  const address = accountData?.address;

  useEffect(() => {
    if (Boolean(address)) {
      dialog.setVisible(false);
    }
  }, [address, dialog]);

  return (
    <>
      {!address && <ConnectButton />}
      {!!address && <ConnectedWalletMenu />}
    </>
  );
};
