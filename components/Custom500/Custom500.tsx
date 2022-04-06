import Link from 'next/link';
import styles from './Custom500.module.css';
import { DISCORD_URL } from 'lib/constants';

export function Custom500() {
  return (
    <div className={styles.div}>
      <p>{'We are having trouble loading this page.'}</p>
      <p>
        {'If refreshing does not work, let us know in '}

        <Link href={DISCORD_URL} passHref>
          <a target={'_blank'} rel="noreferrer">
            #daily-qa on Discord.
          </a>
        </Link>
      </p>
    </div>
  );
}
