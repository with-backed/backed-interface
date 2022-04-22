import { DISCORD_URL, GITHUB_URL, TWITTER_URL } from 'lib/constants';
import Link from 'next/link';
import React from 'react';
import styles from './Footer.module.css';

type Link = {
  title: string;
  href: string;
};

const LINKS: Link[] = [
  {
    title: '🤝 Terms of Service',
    href: '/legal/terms-of-service.pdf',
  },
  {
    title: '🔒 Privacy Policy',
    href: '/legal/privacy-policy.pdf',
  },
  {
    title: '💼 Contract Audits',
    href: 'https://code4rena.com/reports/2022-04-backed/',
  },
  {
    title: '⚙️ GitHub',
    href: GITHUB_URL,
  },
  {
    title: '🐦 Twitter',
    href: TWITTER_URL,
  },
  {
    title: '📣 Discord',
    href: DISCORD_URL,
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles['footer-links']}>
        {LINKS.map((link) => {
          return (
            <li key={link.title}>
              <Link href={link.href}>{link.title}</Link>
            </li>
          );
        })}
        <li>🥕</li>
      </ul>
    </footer>
  );
}
