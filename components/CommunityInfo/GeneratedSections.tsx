import React from 'react';
import { XPFieldset } from './XPFieldset';
import styles from './CommunityInfo.module.css';

export function GeneratedSections() {
  return (
    <>
      <div className={styles.section}>
        <h2>Automatically Awarded XP</h2>
        <p className={styles.explanation}>
          These actions are tracked and logged by bots, reviewed by humans every
          Friday, and the XP automatically appear on your Community NFT.
        </p>
        <div className={styles.xp}>
          <XPFieldset kind="activity">
            <p>
              As a lender, provide your first loan (+1XP for 1st, 2nd, 4th, 8th)
            </p>
            <p>
              As a borrower, pay interest on your first loan (+1XP for 1st, 2nd,
              4th, 8th)
            </p>
          </XPFieldset>
          <XPFieldset kind="contributor">
            <p>
              Create a pull request that is merged (start in #dev on Discord)
            </p>
          </XPFieldset>
          <XPFieldset kind="community">
            <p>Attend your first community call, Mondays at 11AM EST</p>
            <p>Achieve a 4-week streak of community calls</p>
          </XPFieldset>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Nominated XP</h2>
        <p className={styles.explanation}>
          Some XP require a nomination process, to help keep bots and farmers in
          check. Once you complete a task or do something noteworthy, nominate
          yourself for XP using this form. You can also nominate others!
        </p>
        <div className={styles.xp}>
          <XPFieldset kind="activity">
            <p>
              Nominate yourself for XP for remarkable protocol usage, such as:
            </p>
            <ul>
              <li>Lend or borrow the highest loan amount ever</li>
              <li>Use a Noun as collateral</li>
            </ul>
          </XPFieldset>
          <XPFieldset kind="contributor">
            <p>
              Nominate yourself for XP that help develop the protocol, such as:
            </p>
            <ul>
              <li>Code reviews on Github</li>
              <li>Design assets used in production</li>
              <li>Smart-Contract auditing</li>
              <li>Early-release testing and testnet transactions</li>
            </ul>
          </XPFieldset>
          <XPFieldset kind="community">
            <p>
              Nominate yourself for XP that add your voice to the community,
              such as:
            </p>
            <ul>
              <li>Join Backed Discord and follow Backed on Twitter</li>
              <li>Organize a meetup at a conference</li>
              <li>Quality memes</li>
            </ul>
          </XPFieldset>
        </div>
      </div>
    </>
  );
}
