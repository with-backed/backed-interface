import { Button, TextButton } from 'components/Button';
import { ConnectWallet } from 'components/ConnectWallet';
import { Logo } from 'components/Logo';
import { NetworkSelector } from 'components/NetworkSelector';
import { useConfig } from 'hooks/useConfig';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AngelBunny from 'public/angelbunny-XL.png';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import styles from './Header.module.css';
import Image from 'next/image';

const ANNOUNCEMENT_URL =
  'https://backed.mirror.xyz/Y7aaIAo8TG9vVCYp1X0bJBTC0wEGR3OS57iMUG3DyCg';

type Page = {
  name: string;
  route: string;
  // Some pages (about, community) don't fit into our resource-oriented hierarchy.
  // We'll just put them at the top-level
  isNetworkSpecialCase?: boolean;
};
const prodPages: Page[] = [
  { name: 'Lend', route: '' },
  // { name: 'Borrow', route: 'loans/create' },
  { name: 'About', route: 'about', isNetworkSpecialCase: true },
];

const stagingPages: Page[] = [
  { name: 'Community', route: 'community', isNetworkSpecialCase: true },
];

function isActiveRoute(activeRoute: string, candidate: string) {
  if (candidate.length === 0) {
    return activeRoute.length === 0;
  }

  return activeRoute.startsWith(candidate);
}

type NavLinksProps = {
  activeRoute: string;
};
function NavLinks({ activeRoute }: NavLinksProps) {
  const { network } = useConfig();

  const pages = useMemo(() => {
    if (process.env.VERCEL_ENV === 'production') {
      return prodPages;
    }
    return [...prodPages, ...stagingPages];
  }, []);

  return (
    <ul className={styles.links}>
      {pages.map((p) => (
        <li key={p.name}>
          <Link
            href={
              p.isNetworkSpecialCase
                ? `/${p.route}`
                : `/network/${network}/${p.route}`
            }>
            <a
              className={
                isActiveRoute(activeRoute, p.route)
                  ? styles['link-active']
                  : styles.link
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
  activeRoute: string;
  closeMobileMenu: () => void;
  mobileMenuNode: React.RefObject<HTMLDivElement>;
  mobileMenuOpen: boolean;
};
function MobileMenu({
  activeRoute,
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
        <NavLinks activeRoute={activeRoute} />
        <ConnectWallet />
        {!shouldHideNetworkSelector(activeRoute) && <NetworkSelector />}
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
  const { pathname } = useRouter();

  const activeRoute = useMemo(() => {
    // Handling these since they aren't network-namespaced
    if (pathname === '/404' || pathname === '/500') {
      return 'errorPage';
    }
    if (pathname.startsWith('/community') || pathname === '/about') {
      return pathname.substring(1);
    }
    return pathname.split('[network]/')[1] || '';
  }, [pathname]);

  return (
    <nav className={styles.nav}>
      <div className={styles.shutdown}>
        <div className={styles['shutdown-content']}>
          <Image
            height={67}
            width={56}
            src={AngelBunny}
            alt=""
            priority
            placeholder="blur"
          />
          <p>
            This interface will go offline September 1, 2023. The protocol will
            continue to operate.
            <br />
            Read{' '}
            <Link href={ANNOUNCEMENT_URL}>
              <a className={styles.announcement}>the announcement</a>
            </Link>
            .
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles['desktop-header']}>
          <div className={styles['left-side']}>
            <LogoLink />
            <NavLinks activeRoute={activeRoute} />
          </div>
          <div className={styles.controls}>
            {shouldHideNetworkSelector(activeRoute) ? (
              <span />
            ) : (
              <NetworkSelector />
            )}
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
          activeRoute={activeRoute}
          closeMobileMenu={closeMobileMenu}
          mobileMenuNode={mobileMenuNode}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>
    </nav>
  );
}

/**
 * On pages that aren't network-namespaced, we should hide the network selector to avoid confusion.
 * @param activeRoute the current page
 */
function shouldHideNetworkSelector(activeRoute: string) {
  return ['errorPage', 'community', 'community/[address]', 'about'].some(
    (v) => v === activeRoute,
  );
}
