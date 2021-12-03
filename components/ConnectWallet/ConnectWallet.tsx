import React, { useCallback, useEffect } from 'react';
import { DialogDisclosureButton, WalletButton } from 'components/Button';
import styles from './ConnectWallet.module.css';
import { useWeb3 } from 'hooks/useWeb3';
import { Modal } from 'components/Modal';
import { useDialogState } from 'reakit/Dialog';
import { FormWrapper } from 'components/layouts/FormWrapper';

import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { env } from 'process';

declare global {
  interface Window {
    ethereum: any;
  }
}

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '');
const supportedChainIds = [chainId];

export const ConnectWallet = () => {
  const { account, activate, ...ctx } = useWeb3();
  console.log({ account, ...ctx });
  const dialog = useDialogState();

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

  const activateWalletConnectProvider = useCallback(() => {
    const walletConnectConnector = new WalletConnectConnector({
      rpc: { [chainId]: env.NEXT_PUBLIC_JSON_RPC_PROVIDER || '' },
      chainId,
    });

    activate(walletConnectConnector);
  }, [activate]);

  const activateWalletLinkProvider = useCallback(() => {
    const walletLinkConnector = new WalletLinkConnector({
      appName: '💸✨🎸 NFT Pawn Shop 💍✨💸',
      url: 'https://nft-pawn-shop-rinkeby.vercel.app/',
      supportedChainIds,
    });
    activate(walletLinkConnector);
  }, [activate]);

  useEffect(() => {
    // Auto-hide modal when user successfully connects
    if (account) {
      dialog.setVisible(false);
    }
  }, [account, dialog]);

  return (
    <>
      {!account && (
        <DialogDisclosureButton {...dialog}>
          Connect Wallet
        </DialogDisclosureButton>
      )}
      {!!account && (
        <div className={styles.connected}>👤 {account.slice(0, 7)}...</div>
      )}
      <Modal
        dialog={dialog}
        width="narrow"
        heading="✨ 🔑️ Connect Wallet ⚙️ ✨">
        <FormWrapper>
          <WalletButton wallet="Metamask" onClick={activateInjectedProvider} />
          <WalletButton
            wallet="Coinbase Wallet"
            onClick={activateWalletLinkProvider}
          />
          <WalletButton
            wallet="Wallet Connect"
            onClick={activateWalletConnectProvider}
          />
          <p>
            By connecting a wallet, you agree to NFT Pawn Shop&apos;s Terms of
            Service and acknowledge that you have read and understand the NFT
            Pawn Shop protocol disclaimer.
          </p>
        </FormWrapper>
      </Modal>
    </>
  );
};
