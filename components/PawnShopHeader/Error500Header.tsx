import { PawnShopHeader } from './PawnShopHeader';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PawnShopHeader.module.css';
import errorLogo from './500.png';

export function Error500Header() {
  return (
    <PawnShopHeader>
      <Link href="/" passHref>
        <a className={styles.link}>
          <Image src={errorLogo} alt="500 Error" priority={true} />
        </a>
      </Link>
    </PawnShopHeader>
  );
}
