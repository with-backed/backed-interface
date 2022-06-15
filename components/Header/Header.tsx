import { Button, TextButton } from 'components/Button';
import { ConnectWallet } from 'components/ConnectWallet';
import { Logo } from 'components/Logo';
import { NetworkSelector } from 'components/NetworkSelector';
import { useConfig } from 'hooks/useConfig';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import styles from './Header.module.css';

const pages = [
  { name: 'Lend', route: '' },
  { name: 'Borrow', route: 'loans/create' },
  { name: 'About', route: 'about' },
];

function NavLinks() {
  const { network } = useConfig();
  const { pathname } = useRouter();

  const activeRoute = useMemo(() => {
    // Handling these since they aren't network-namespaced
    if (pathname === '/404' || pathname === '/500') {
      return 'errorPage';
    }
    return pathname.split('[network]/')[1] || '';
  }, [pathname]);

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

function LogoLink() {
  const { network } = useConfig();
  const { pathname } = useRouter();

  const isErrorPage = useMemo(
    () => pathname === '/404' || pathname === '/500',
    [pathname],
  );

  return (
    <Link href={`/network/${network}/`} passHref>
      <a title="Backed">
        <Logo error={isErrorPage} />
      </a>
    </Link>
  );
}

type MobileMenuProps = {
  closeMobileMenu: () => void;
  mobileMenuNode: React.RefObject<HTMLDivElement>;
  mobileMenuOpen: boolean;
};
function MobileMenu({
  closeMobileMenu,
  mobileMenuNode,
  mobileMenuOpen,
}: MobileMenuProps) {
  return (
    <div
      className={
        mobileMenuOpen ? styles['mobile-nav-open'] : styles['mobile-nav']
      }>
      <div ref={mobileMenuNode} className={styles['mobile-menu-buttons']}>
        <NavLinks />
        <ConnectWallet />
        <NetworkSelector />
        <TextButton onClick={closeMobileMenu}>Close</TextButton>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const mobileMenuNode = useRef<HTMLDivElement>(null);
  useOnClickOutside(mobileMenuNode, () => setMobileMenuOpen(false));

  return (
    <nav className={styles.nav}>
      <div className={styles.content}>
        <div className={styles['desktop-header']}>
          <div className={styles['left-side']}>
            <LogoLink />
            <NavLinks />
          </div>
          <div className={styles.controls}>
            <NetworkSelector />
            <ConnectWallet />
          </div>
        </div>

        <div className={styles['mobile-header']}>
          <div className={styles['left-side']}>
            <LogoLink />
          </div>
          <div className={styles.controls}>
            <Button
              onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
              kind={mobileMenuOpen ? 'secondary' : 'primary'}>
              🍔 Menu
            </Button>
          </div>
        </div>
        <MobileMenu
          closeMobileMenu={closeMobileMenu}
          mobileMenuNode={mobileMenuNode}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>
    </nav>
  );
}
