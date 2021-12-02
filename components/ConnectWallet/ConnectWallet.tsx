import React, { memo, useState } from 'react';
import { Button } from 'components/Button';
import styles from './ConnectWallet.module.css';
import { noop } from 'lodash';
import { useWeb3 } from 'hooks/useWeb3';

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
  const { account, ...ctx } = useWeb3();
  const [providerAvailable, setProviderAvailable] = useState(false);

  console.log({ ctx });

  if (!providerAvailable) {
    return <NoProvider />;
  }

  if (!account) {
    return <Button onClick={noop}>Connect Wallet</Button>;
  }

  return <div className={styles.connected}>👤 {account.slice(0, 7)}...</div>;
};
