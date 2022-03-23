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

type PawnShopHeaderProps = {
  prawn?: boolean;
};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = () => {
  const { messages, removeMessage } = useGlobalMessages();
  useNetworkMonitor();
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
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
      <header className={styles.header}>
        <TwelveColumn>
          <div className={styles.pawn}>
            <ButtonLink kind={kind} href={CREATE_PATH}>
              Pawn Your NFT
            </ButtonLink>
          </div>

          <Link href="/" passHref>
            <a title="Backed" className={styles.link}>
              <BackedBunny />
            </a>
          </Link>

          <div className={styles['connect-wallet']}>
            <ConnectWallet />
          </div>
        </TwelveColumn>
      </header>
    </>
  );
};
