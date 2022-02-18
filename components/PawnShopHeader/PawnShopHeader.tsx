import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { ConnectWallet } from 'components/ConnectWallet';
import styles from './PawnShopHeader.module.css';
import { ButtonLink } from 'components/Button';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from './rinkebeeee.png';
import betterLogo from './prawnshop.png';
import { TwelveColumn } from 'components/layouts/TwelveColumn';

type PawnShopHeaderProps = {
  prawn?: boolean;
};

const CREATE_PATH = '/loans/create';

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = ({
  prawn,
}) => {
  const { pathname } = useRouter();
  const kind = pathname === CREATE_PATH ? 'secondary' : 'primary';
  return (
    <header className={styles.header}>
      <TwelveColumn>
        <div className={styles.pawn}>
          <ButtonLink kind={kind} href={CREATE_PATH}>
            Pawn Your NFT
          </ButtonLink>
        </div>

        <Link href="/" passHref>
          <a className={styles.link}>
            {prawn ? (
              <Image src={betterLogo} alt="NFT Pawn Shop" priority={true} />
            ) : (
              <Image src={logo} alt="NFT Pawn Shop" priority={true} />
            )}
          </a>
        </Link>

        <div className={styles['connect-wallet']}>
          <ConnectWallet />
        </div>
      </TwelveColumn>
    </header>
  );
};
