import { Button } from 'components/Button';
import Image from 'next/image';
import React from 'react';
import styles from './CommunityHeader.module.css';
import { PlaceholderBunn } from './PlaceholderBunn';
import optimismCircle from './optimism-circle.png';

export function CommunityHeader() {
  return (
    <div className={styles.wrapper}>
      <PlaceholderBunn />
      <div className={styles.cta}>
        <h1>You are invited!</h1>
        <p>Join the Backed community with your free-to-mint, soulbound NFT.</p>
        <p>
          Track your activity, earn XP, and update your on-chain art to show off
          your achievements.
        </p>
        <Button disabled>Mint for Free</Button>

        <p>
          Connect your wallet on{' '}
          <Image src={optimismCircle} alt="" height={18} width={18} /> Optimism
          network.
        </p>
      </div>
    </div>
  );
}
