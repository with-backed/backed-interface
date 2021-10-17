import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

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
    let account = ethers.utils.getAddress(accounts[0]);
    // setAccount(account)
    addressSetCallback(account);
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('accounts changed');
      account = ethers.utils.getAddress(accounts[0]);
      // setAccount(account)
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
          {account == null ? (
            <div
              onClick={getAccount}
              id="connect-addr-button"
              className={`button-${buttonType}`}
            >
              {' '}
              Connect Address
              {' '}
            </div>
          ) : (
            <div className="float-right">
              <p className="float-left century button-2">
                {' '}
                {account.slice(0, 10)}
                ...
                {' '}
              </p>
            </div>
          )}
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
