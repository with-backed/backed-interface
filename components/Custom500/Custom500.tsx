import Link from 'next/link';
import styles from './Custom500.module.css';

export function Custom500() {
  return (
    <div className={styles.div}>
      <p>{'We are having trouble loading this page.'}</p>
      <p>
        {'If refreshing does not work, let us know in '}

        <Link href="https://discord.gg/ZCxGuE6Ytk" passHref>
          <a target={'_blank'} rel="noreferrer">
            #daily-qa on Discord.
          </a>
        </Link>
      </p>
    </div>
  );
}
