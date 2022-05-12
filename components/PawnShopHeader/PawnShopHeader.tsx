import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { Button, ButtonLink, TextButton } from 'components/Button';
import { useRouter } from 'next/router';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { Banner } from 'components/Banner';
import { useKonami } from 'hooks/useKonami';
import { WrongNetwork } from 'components/Banner/messages';
import { HeaderInfo } from 'components/HeaderInfo';
import { Chevron } from 'components/Icons/Chevron';
import { useHasCollapsedHeaderInfo } from 'hooks/useHasCollapsedHeaderInfo';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { useConfig } from 'hooks/useConfig';
import { Logo } from 'components/Logo';
import { NetworkSelector } from 'components/NetworkSelector';

type PawnShopHeaderProps = {
  isErrorPage?: boolean;
  showInitialInfo?: boolean;
};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = ({
  isErrorPage,
  showInitialInfo = false,
}) => {
  const { chainId, network } = useConfig();
  const { messages, removeMessage } = useGlobalMessages();
  const { pathname } = useRouter();
  const kind = pathname.endsWith(CREATE_PATH) ? 'secondary' : 'primary';
  const codeActive = useKonami();
  const { hasCollapsed, onCollapse } = useHasCollapsedHeaderInfo();
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(
    hasCollapsed ? true : !showInitialInfo,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const mobileMenuNode = useRef<HTMLElement>(null);
  useOnClickOutside(mobileMenuNode, () => setMobileMenuOpen(false));

  const toggleVisible = useCallback(() => {
    if (!isInfoCollapsed) {
      onCollapse();
    }
    setIsInfoCollapsed((prev) => !prev);
  }, [isInfoCollapsed, onCollapse]);

  return (
    <>
      <div className={styles['banner-container']}>
        <WrongNetwork expectedChainId={chainId} />
        {messages.map((m) => {
          const close = () => removeMessage(m);
          return (
            // It's possible for a ReactNode to be null, but `message` shouldn't be on a banner.
            <Banner key={m.message as any} kind={m.kind} close={close}>
              {m.message}
            </Banner>
          );
        })}
      </div>
      <nav className={styles.header}>
        <TwelveColumn>
          <div className={styles.pawn}>
            {isInfoCollapsed ? (
              <Button onClick={toggleVisible}>📘 Info</Button>
            ) : (
              <Button kind="secondary" onClick={toggleVisible}>
                📖 Info
              </Button>
            )}
            <ButtonLink kind={kind} href={`/network/${network}${CREATE_PATH}`}>
              Create a Loan
            </ButtonLink>
          </div>

          <Link href={`/network/${network}/`} passHref>
            <a
              title="Backed"
              className={codeActive ? styles['flipped-link'] : styles.link}>
              <Logo codeActive={codeActive} error={isErrorPage} />
            </a>
          </Link>

          <div className={styles['connect-wallet']}>
            <NetworkSelector />
            <ConnectWallet />
          </div>
        </TwelveColumn>
      </nav>
      <nav className={styles['mobile-header']}>
        <Link href={`/network/${network}/`} passHref>
          <a title="Backed">
            <Logo codeActive={codeActive} error={isErrorPage} />
          </a>
        </Link>
        <Button
          onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
          kind={mobileMenuOpen ? 'secondary' : 'primary'}>
          🍔 Menu
        </Button>
        <nav
          className={
            mobileMenuOpen ? styles['mobile-nav-open'] : styles['mobile-nav']
          }>
          <div
            ref={mobileMenuNode as any}
            className={styles['mobile-menu-buttons']}>
            <ButtonLink kind={kind} href={`/network/${network}${CREATE_PATH}`}>
              Create a Loan
            </ButtonLink>
            {isInfoCollapsed ? (
              <Button onClick={toggleVisible}>📘 Info</Button>
            ) : (
              <Button kind="secondary" onClick={toggleVisible}>
                📖 Info
              </Button>
            )}
            <ConnectWallet />
            <NetworkSelector />
            <TextButton onClick={closeMobileMenu}>Close</TextButton>
          </div>
        </nav>
      </nav>
      <div className={styles['header-info-wrapper']}>
        <HeaderInfo isCollapsed={isInfoCollapsed} />
        {!isInfoCollapsed && (
          <Button
            aria-label="Close getting-started info"
            kind="circle"
            onClick={toggleVisible}>
            <Chevron />
          </Button>
        )}
      </div>
    </>
  );
};
