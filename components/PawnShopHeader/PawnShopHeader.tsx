import React, { FunctionComponent, useState } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { Button, ButtonLink } from 'components/Button';
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

type PawnShopHeaderProps = {
  isErrorPage?: boolean;
  showInitialInfo?: boolean;
};

const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);
const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = ({
  isErrorPage,
  showInitialInfo = false,
}) => {
  const { messages, removeMessage } = useGlobalMessages();
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
  const codeActive = useKonami();
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(!showInitialInfo);
  return (
    <>
      <div className={styles['banner-container']}>
        <WrongNetwork expectedChainId={expectedChainId} />
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

          <Link href="/" passHref>
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
            <ConnectWallet />
          </div>
        </TwelveColumn>
      </nav>
      <nav className={styles['mobile-header']}>
        <Link href="/" passHref>
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
        <div className={styles['sausage-links']}>
          <ConnectWallet />
          <ButtonLink kind={kind} href={CREATE_PATH}>
            Create a Loan
          </ButtonLink>
        </div>
      </nav>
      <div className={styles['header-info-wrapper']}>
        <HeaderInfo isCollapsed={isInfoCollapsed} />
        {!isInfoCollapsed && (
          <Button
            aria-label="Close getting-started info"
            kind="circle"
            onClick={() => setIsInfoCollapsed(true)}>
            <Chevron />
          </Button>
        )}
      </div>
    </>
  );
};
