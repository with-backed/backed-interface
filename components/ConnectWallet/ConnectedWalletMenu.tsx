import { Button, ButtonLink } from 'components/Button';
import { DisplayAddress } from 'components/DisplayAddress';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from './ConnectWallet.module.css';

type ConnectedWalletMenuProps = {};

export function ConnectedWalletMenu({}: ConnectedWalletMenuProps) {
  const [{ data }, disconnect] = useAccount();
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

  const address = data?.address;

  if (!address) {
    return null;
  }

  return (
    <div className={styles.wrapper} ref={container}>
      <Button
        onClick={toggleOpen}
        kind="secondary"
        style={{ background: open ? 'var(--highlight-visited-10)' : '' }}>
        <span className={styles.address}>
          🔓 <DisplayAddress address={address} />
        </span>
      </Button>
      <div className={styles.menu} style={{ display: open ? '' : 'none' }}>
        <ButtonLink href={`/profile/${address}`} kind="tertiary">
          Profile
        </ButtonLink>
        <Button kind="tertiary" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}
