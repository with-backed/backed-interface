import React from 'react';
import styles from './HeaderInfo.module.css';
import Image from 'next/image';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import borrowerBunny from './borrower-bunny.png';
import investigativeBunny from './investigative-bunny.png';
import lenderBunny from './lender-bunny.png';
import { animated, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import Link from 'next/link';
import { DISCORD_URL, FAQ_URL, TWITTER_URL } from 'lib/constants';
import { TextButton } from 'components/Button';
import { useDialogState } from 'reakit/Dialog';
import { Modal } from 'components/Modal';
import { Carousel } from 'components/Carousel';

type HeaderInfoProps = {
  isCollapsed?: boolean;
};

export function HeaderInfo({ isCollapsed = true }: HeaderInfoProps) {
  const [ref, bounds] = useMeasure();
  const dialog = useDialogState();

  const headerInfoAnimatedStyle = useSpring({
    height: isCollapsed ? 0 : bounds.height || 'auto',
  });

  return (
    <>
      <animated.div style={headerInfoAnimatedStyle} className={styles.wrapper}>
        <TwelveColumn ref={ref}>
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
              BORROWERS, use your NFTs as collateral to borrow any token. Set
              your terms and let lenders compete to give you larger, longer,
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
              Launch a quick explanation of{' '}
              <TextButton onClick={dialog.show} kind="clickable">
                how it works
              </TextButton>
              . Read the{' '}
              <Link href={FAQ_URL}>
                <a target="_blank">FAQ</a>
              </Link>
              . Follow on{' '}
              <Link href={TWITTER_URL}>
                <a target="_blank">Twitter</a>
              </Link>
              . Join the community on{' '}
              <Link href={DISCORD_URL}>
                <a target="_blank">Discord</a>
              </Link>
              .
            </p>
          </div>
        </TwelveColumn>
      </animated.div>
      <Modal heading="🖼️ How It Works 🐇" dialog={dialog}>
        <Carousel />
      </Modal>
    </>
  );
}
