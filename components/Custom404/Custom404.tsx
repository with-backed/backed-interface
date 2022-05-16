import Link from 'next/link';
import styles from './Custom404.module.css';
import { DISCORD_ERROR_CHANNEL, DISCORD_URL } from 'lib/constants';

export function Custom404() {
  return (
    <div className={styles.div}>
      <p>{"The URL you're looking for doesn't seem to exist."}</p>
      <p>
        {"If you think there's an error, let us know in "}

        <Link href={DISCORD_URL} passHref>
          <a target={'_blank'} rel="noreferrer">
            {DISCORD_ERROR_CHANNEL} on Discord.
          </a>
        </Link>
      </p>
    </div>
  );
}
