import React, { FunctionComponent, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from 'components/Button';

declare global {
  interface Window {
    ethereum: any;
  }
}

type ConnectWalletProps = {
  account?: string | null;
  addressSetCallback: (address: string) => void;
}

export const ConnectWallet: FunctionComponent<ConnectWalletProps> = ({
  account,
  addressSetCallback,
}) => {
  const [providerAvailable, setProviderAvailable] = useState(false);

  const getAccount = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (process.env.NEXT_PUBLIC_ENV != 'local') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: process.env.NEXT_PUBLIC_CHAIN_ID }]
      })
    }
    let account = ethers.utils.getAddress(accounts[0]);
    addressSetCallback(account);
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('accounts changed');
      account = ethers.utils.getAddress(accounts[0]);
      addressSetCallback(account);
    });
  };

  const setup = async () => {
    if (window.ethereum == null) {
      setProviderAvailable(false);
      return;
    }
    setProviderAvailable(true);
    // This currently isn't used, is it still necessary?
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  };

  useState(() => {
    setup();
  });

  if (!providerAvailable) {
    return (
      <div id="use-metamask">
        Please use
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">
          Metamask
        </a>
        +
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noreferrer"
        >
          Chrome
        </a>
        to connect
      </div>
    )
  }

  if (!account) {
    return (
      <Button onClick={getAccount}>Connect Wallet</Button>
    )
  }

  return (
    <div id="connect-wallet-button">
      connected {account.slice(0, 7)}...
    </div>
  );
}
