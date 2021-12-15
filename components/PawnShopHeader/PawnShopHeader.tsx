import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { ButtonLink } from 'components/Button';
import { useRouter } from 'next/router';

type PawnShopHeaderProps = {};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = () => {
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
  return (
    <header className={styles.header}>
      <div className={styles['top-row']}>
        <div className={styles.pawn}>
          <ButtonLink kind={kind} href={CREATE_PATH}>
            Pawn Your NFT
          </ButtonLink>
        </div>
        <h1 className={styles.link}>
          <Link href="/">💸✨🎸 NFT Pawn Shop 💍✨💸</Link>
        </h1>
        <div className={styles['connect-wallet']}>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};
