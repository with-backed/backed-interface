import React, {
  FunctionComponent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import { Button } from 'components/Button';
import { AccountContext } from 'context/account';

declare global {
  interface Window {
    ethereum: any;
  }
}

type ExternalLinkProps = {
  href: string;
  display: React.ReactNode;
};
const ExternalLink = memo(function ExternalLink({
  display,
  href,
}: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {display}
    </a>
  );
});

const NoProvider = memo(function NoProvider() {
  const metamaskLink = (
    <ExternalLink href="https://metamask.io" display="Metamask" />
  );
  const chromeLink = (
    <ExternalLink href="https://www.google.com/chrome/" display="Chrome" />
  );
  return (
    <p>
      Please use {metamaskLink} + {chromeLink} to connect.
    </p>
  );
});

export const ConnectWallet = () => {
  const { account, setAccount } = useContext(AccountContext);
  const [providerAvailable, setProviderAvailable] = useState(false);

  const getAccount = useCallback(async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (process.env.NEXT_PUBLIC_ENV != 'local') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: process.env.NEXT_PUBLIC_CHAIN_ID }],
      });
    }
    let account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('accounts changed');
      account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  }, [setAccount]);

  const setup = useCallback(async () => {
    if (window.ethereum == null) {
      setProviderAvailable(false);
      return;
    }
    setProviderAvailable(true);
    // This currently isn't used, is it still necessary?
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  if (!providerAvailable) {
    return <NoProvider />;
  }

  if (!account) {
    return <Button onClick={getAccount}>Connect Wallet</Button>;
  }

  return (
    <div id="connect-wallet-button">connected {account.slice(0, 7)}...</div>
  );
};
