import { PawnShopHeader } from './PawnShopHeader';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PawnShopHeader.module.css';
import errorLogo from './404.png';

export function Error404Header() {
  return (
    <PawnShopHeader>
      <Link href="/" passHref>
        <a className={styles.link}>
          <Image src={errorLogo} alt="404 Error" priority={true} />
        </a>
      </Link>
    </PawnShopHeader>
  );
}
