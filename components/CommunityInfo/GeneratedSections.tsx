import React from 'react';
import { XPFieldset } from './XPFieldset';
import styles from './CommunityInfo.module.css';

export function GeneratedSections() {
  return (
    <>
      <div className={styles.section}>
        <h2>Automatically Awarded XP</h2>
        <p className={styles.explanation}>
          These actions are tracked and logged by bots, reviewed by humans
          weekly, and the XP automatically appear on your Community NFT.
        </p>
        <div className={styles.xp}>
          <XPFieldset kind="activity">
            <ul>
              <li>As a lender, provide your first loan</li>
              <li>As a borrower, pay interest on your first loan</li>
            </ul>
          </XPFieldset>

          <XPFieldset kind="contributor">
            <ul>
              <li>
                Author a pull request that is merged (start in #dev on Discord)
              </li>
            </ul>
          </XPFieldset>

          <XPFieldset kind="community">
            <ul>
              <li>Attend your first community call, Mondays at 11AM EST</li>
              <li>
                Addional XP with exponential decay: 2nd call, 4th call, 8th,
                16th, etc.
              </li>
            </ul>
          </XPFieldset>
        </div>
      </div>

      <div className={styles.section}>
        <h2>XP Awarded via Nomination Form</h2>
        <p className={styles.explanation}>
          Some XP require a nomination process, to limit bots or scams. Once you
          complete a task or do something noteworthy, nominate yourself (or
          others!) for XP using the{' '}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSd5jfpa7okOGHU6WgIhqCtg_ImndrivZtVq3-Vk5OBmhCeY-Q/viewform">
            nomination form
          </a>
          .
        </p>
        <div className={styles.xp}>
          <XPFieldset kind="activity">
            <p>
              Nominate yourself for XP for remarkable protocol usage for which
              there is no automated tracking, such as:
            </p>
            <ul>
              <li>First ever loan</li>
              <li>Loan with most buyouts</li>
            </ul>
          </XPFieldset>

          <XPFieldset kind="contributor">
            <p>
              Nominate yourself for XP that help develop the protocol, such as:
            </p>
            <ul>
              <li>Early-release testing and testnet transactions</li>
              <li>Code reviews on Github</li>
              <li>Design assets used in production</li>
              <li>Smart contract auditing</li>
            </ul>
          </XPFieldset>

          <XPFieldset kind="community">
            <p>
              Nominate yourself for XP that add your voice to the community,
              such as:
            </p>
            <ul>
              <li>Organize a meetup at a conference</li>
              <li>Quality memes</li>
            </ul>
          </XPFieldset>
        </div>
      </div>
    </>
  );
}
