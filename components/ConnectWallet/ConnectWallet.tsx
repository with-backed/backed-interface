import React, { useCallback, useEffect, useState } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { DialogDisclosureButton, WalletButton } from 'components/Button';
import { Modal } from 'components/Modal';
import { useWeb3 } from 'hooks/useWeb3';
import { useDialogState } from 'reakit/Dialog';
import styles from './ConnectWallet.module.css';
import { FormWrapper } from 'components/layouts/FormWrapper';

declare global {
  interface Window {
    ethereum: any;
  }
}

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '');
const supportedChainIds = [chainId];

const visitMetaMask = () => {
  window.open('https://metamask.io', '_blank');
};

export const ConnectWallet = () => {
  const [providerAvailable, setProviderAvailable] = useState(false);
  const { account, activate } = useWeb3();
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
      rpc: { [chainId]: process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER || '' },
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
          <WalletButton
            wallet="MetaMask"
            onClick={
              providerAvailable ? activateInjectedProvider : visitMetaMask
            }
          />
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
