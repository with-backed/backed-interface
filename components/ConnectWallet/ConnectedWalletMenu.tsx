import { Button, ButtonLink } from 'components/Button';
import { DisplayAddress } from 'components/DisplayAddress';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ConnectWallet.module.css';

type ConnectedWalletMenuProps = {};

export function ConnectedWalletMenu({}: ConnectedWalletMenuProps) {
  const { account, deactivate } = useWeb3();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  const handleClick = useCallback(
    (ev: MouseEvent) => {
      if (container.current && !container.current.contains(ev.target as any)) {
        setOpen(false);
      }
    },
    [container, setOpen],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  if (!account) {
    return null;
  }

  return (
    <div className={styles.wrapper} ref={container}>
      <Button
        onClick={toggleOpen}
        kind="secondary"
        style={{ background: open ? 'var(--highlight-visited-10)' : '' }}>
        🔓 <DisplayAddress address={account} />
      </Button>
      <div className={styles.menu} style={{ display: open ? '' : 'none' }}>
        <ButtonLink href={`/profile/${account}`} kind="tertiary">
          Profile
        </ButtonLink>
        <Button kind="tertiary" onClick={deactivate}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}
