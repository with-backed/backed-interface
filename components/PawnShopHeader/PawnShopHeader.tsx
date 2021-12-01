import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { Marquee } from 'components/Marquee';

type PawnShopHeaderProps = {
  messages: React.ReactNode[];
  marqueeStoppedByDefault?: boolean;
};

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = ({
  messages,
  marqueeStoppedByDefault = false,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles['top-row']}>
        <div className={styles.help}>
          {/* this div intentionally left blank until we use the info icon */}
        </div>
        <h1 className={styles.link}>
          <Link href="/">💸✨🎸 NFT Pawn Shop 💍✨💸</Link>
        </h1>
        <div className={styles['connect-wallet']}>
          <ConnectWallet />
        </div>
      </div>
      <Marquee
        messages={messages}
        initialStoppedState={marqueeStoppedByDefault}
      />
    </header>
  );
};
