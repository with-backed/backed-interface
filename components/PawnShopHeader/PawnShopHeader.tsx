import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { ButtonLink } from 'components/Button';
import { useRouter } from 'next/router';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { Banner } from 'components/Banner';
import backedBunny from './backed-bunny.png';
import borkedBunny from './borked-bunny.png';
import pepe from './pepe-bunny-line.png';
import { useKonami } from 'hooks/useKonami';
import Image from 'next/image';

type PawnShopHeaderProps = {
  isErrorPage?: boolean;
};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = (
  props,
) => {
  const { messages, removeMessage } = useGlobalMessages();
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
  const codeActive = useKonami();
  return (
    <>
      <div className={styles['banner-container']}>
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
              {props?.isErrorPage == true ? (
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
            {props?.isErrorPage == true ? (
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
    </>
  );
};
