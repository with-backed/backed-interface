import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { Button, ButtonLink, TextButton } from 'components/Button';
import { useRouter } from 'next/router';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { Banner } from 'components/Banner';
import backedBunny from './backed-bunny.png';
import borkedBunny from './borked-bunny.png';
import pepe from './pepe-bunny-line.png';
import { useKonami } from 'hooks/useKonami';
import Image from 'next/image';
import { WrongNetwork } from 'components/Banner/messages';
import { HeaderInfo } from 'components/HeaderInfo';
import { Chevron } from 'components/Icons/Chevron';
import { useHasCollapsedHeaderInfo } from 'hooks/useHasCollapsedHeaderInfo';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { useConfig } from 'hooks/useConfig';

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
            <ButtonLink kind={kind} href={CREATE_PATH}>
              Create a Loan
            </ButtonLink>
          </div>

          <div className={styles.placeholder}></div>

          <Link href={`/network/${network}/`} passHref>
            <a
              title="Backed"
              className={codeActive ? styles['flipped-link'] : styles.link}>
              {isErrorPage == true ? (
                <Image
                  src={borkedBunny}
                  alt="Error Bunny"
                  height={70}
                  width={70}
                  priority
                />
              ) : codeActive ? (
                <Image src={pepe} alt="tfw" height={70} width={65} priority />
              ) : (
                <Image
                  src={backedBunny}
                  alt="Backed Bunny"
                  height={70}
                  width={70}
                  priority
                />
              )}
            </a>
          </Link>

          <div className={styles['connect-wallet']}>
            {isInfoCollapsed ? (
              <Button onClick={toggleVisible}>📘 Info</Button>
            ) : (
              <Button kind="secondary" onClick={toggleVisible}>
                📖 Info
              </Button>
            )}
            <ConnectWallet />
          </div>
        </TwelveColumn>
      </nav>
      <nav className={styles['mobile-header']}>
        <Link href={`/network/${network}/`} passHref>
          <a title="Backed">
            {isErrorPage == true ? (
              <Image
                src={borkedBunny}
                alt="Error Bunny"
                height={70}
                width={70}
                priority
              />
            ) : (
              <Image
                src={backedBunny}
                alt="Backed Bunny"
                height={70}
                width={70}
                priority
              />
            )}
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
            <ButtonLink kind={kind} href={CREATE_PATH}>
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
