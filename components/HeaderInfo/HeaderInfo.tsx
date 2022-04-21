import React from 'react';
import styles from './HeaderInfo.module.css';
import Image from 'next/image';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import borrowerBunny from './borrower-bunny.png';
import investigativeBunny from './investigative-bunny.png';
import lenderBunny from './lender-bunny.png';
import { Button } from 'components/Button';
import { Chevron } from 'components/Icons/Chevron';

export function HeaderInfo() {
  return (
    <div className={styles.wrapper}>
      <TwelveColumn>
        <div className={styles.info}>
          <Image
            src={borrowerBunny}
            alt="Backed Bunny"
            height={90}
            width={70}
            layout="fixed"
            priority
          />
          <p>
            BORROWERS, use your NFTs as collateral to borrow any token. Set your
            terms and let lenders compete to give you larger, longer,
            lower-interest loans.
          </p>
        </div>
        <div className={styles.info}>
          <Image
            src={lenderBunny}
            alt="Backed Bunny"
            height={90}
            width={70}
            layout="fixed"
            priority
          />
          <p>
            LENDERS, earn interest on NFT-backed loans. If you see a NFT you
            want to lend to, &ldquo;buy out&rdquo; the current lender by
            offering better terms.
          </p>
        </div>
        <div className={styles.info}>
          <Image
            src={investigativeBunny}
            alt="Backed Bunny"
            height={90}
            width={70}
            layout="fixed"
            priority
          />
          <p>
            Read the <a>FAQ</a>. Follow on <a>Twitter</a>. Join the community on{' '}
            <a>Discord</a>.
          </p>
        </div>
      </TwelveColumn>
      <Button kind="circle">
        <Chevron />
      </Button>
    </div>
  );
}
