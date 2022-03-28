import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { ButtonLink } from 'components/Button';
import { useRouter } from 'next/router';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { Banner } from 'components/Banner';
import { useNetworkMonitor } from 'hooks/useNetworkMonitor';
import BackedBunny from 'components/Icons/BackedBunny';
import { useKonami } from 'hooks/useKonami';

type PawnShopHeaderProps = {};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = () => {
  const { messages, removeMessage } = useGlobalMessages();
  useNetworkMonitor();
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
  const codeActive = useKonami();
  return (
    <>
      {messages.map((m) => {
        const close = () => removeMessage(m);
        return (
          // It's possible for a ReactNode to be null, but `message` shouldn't be on a banner.
          <Banner key={m.message as any} kind={m.kind} close={close}>
            {m.message}
          </Banner>
        );
      })}
      <nav className={styles.header}>
        <TwelveColumn>
          <div className={styles.pawn}>
            <ButtonLink kind={kind} href={CREATE_PATH}>
              Pawn Your NFT
            </ButtonLink>
          </div>

          <Link href="/" passHref>
            <a
              title="Backed"
              className={codeActive ? styles['flipped-link'] : styles.link}>
              <BackedBunny />
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
            <BackedBunny />
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
