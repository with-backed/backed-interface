import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { env } from 'process';

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function ConnectWallet({
  account,
  addressSetCallback,
  buttonType,
}) {
  // const [account, setAccount] = useState(passedAccount)
  const [providerAvailable, setProviderAvailable] = useState(false);

  const getAccount = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    // await window.ethereum.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId: process.env.NEXT_PUBLIC_CHAIN_ID }]
    // })
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  };

  useState(() => {
    setup();
  });

  return (
    <div>
      {providerAvailable ? (
        <div>
        
            <div
              onClick={getAccount}
              id="connect-wallet-button"
            >
              { account == null ? 
              "Connect Wallet"
              : `connected ${account.slice(0, 7)}...`
              }
            </div>
         
        </div>
      ) : (
        <div id="use-metamask">
          {' '}
          Please use
          <a href="https://metamask.io/" target="_blank" rel="noreferrer">
            {' '}
            Metamask
            {' '}
          </a>
          {' '}
          +
          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            Chrome
            {' '}
          </a>
          {' '}
          to connect
          {' '}
        </div>
      )}
    </div>
  );
}
