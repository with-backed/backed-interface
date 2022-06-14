import { ConnectWallet } from 'components/ConnectWallet';
import { Logo } from 'components/Logo';
import { NetworkSelector } from 'components/NetworkSelector';
import { useConfig } from 'hooks/useConfig';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styles from './Header.module.css';

const pages = [
  { name: 'Lend', route: '' },
  { name: 'Borrow', route: 'loans/create' },
];

function NavLinks() {
  const { network } = useConfig();
  const { pathname } = useRouter();

  const activeRoute = useMemo(
    () => pathname.split('[network]/')[1] || '',
    [pathname],
  );

  return (
    <ul className={styles.links}>
      {pages.map((p) => (
        <li key={p.name}>
          <Link href={`/network/${network}/${p.route}`}>
            <a
              className={
                p.route === activeRoute ? styles['link-active'] : styles.link
              }>
              {p.name}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  return (
    <nav className={styles.nav}>
      <div className={styles.content}>
        <div className={styles['box-left']}>
          <Logo />
        </div>
        <div className={styles.box}>
          <NavLinks />
        </div>
        <div className={styles['box-right']}>
          <div className={styles.controls}>
            <NetworkSelector />
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}
