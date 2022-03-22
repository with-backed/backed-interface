import Link from 'next/link';
import styles from './Custom404.module.css';

export function Custom404() {
  return (
    <div className={styles.div}>
      <p>{"The URL you're looking for doesn't seem to exist."}</p>
      <p>
        {"If you think there's an error, let us know in "}

        <Link href="https://discord.gg/ZCxGuE6Ytk" passHref>
          <a target={'_blank'} rel="noreferrer">
            #daily-qa on Discord.
          </a>
        </Link>
      </p>
    </div>
  );
}
