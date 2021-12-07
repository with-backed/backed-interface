import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button } from 'components/Button';
import { AccountContext } from 'context/account';
import { hooks as metaMaskHooks, metaMask } from 'connectors/metaMask';
import styles from './ConnectWallet.module.css';

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
  const { setAccount } = useContext(AccountContext);
  const [providerAvailable, setProviderAvailable] = useState(false);
  const { useAccount } = metaMaskHooks;
  const account = useAccount();

  const setup = useCallback(async () => {
    if (!window.ethereum) {
      setProviderAvailable(false);
      return;
    }
    setProviderAvailable(true);
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  useEffect(() => {
    if (account) {
      setAccount(account);
    }
  }, [account, setAccount]);

  if (!providerAvailable) {
    return <NoProvider />;
  }

  if (!account) {
    return <Button onClick={() => metaMask.activate()}>Connect Wallet</Button>;
  }

  return <div className={styles.connected}>👤 {account.slice(0, 7)}...</div>;
};
