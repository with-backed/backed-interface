import { PawnShopHeader } from './PawnShopHeader';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PawnShopHeader.module.css';
import logo from './rinkebeeee.png';

export function MainHeader() {
  return (
    <PawnShopHeader>
      <Link href="/" passHref>
        <a className={styles.link}>
          <Image src={logo} alt="NFT Pawn Shop" priority={true} />
        </a>
      </Link>
    </PawnShopHeader>
  );
}
