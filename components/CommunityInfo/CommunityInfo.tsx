import { Fieldset } from 'components/Fieldset';
import React, { useMemo } from 'react';
import Image from 'next/image';
import styles from './CommunityInfo.module.css';
import pinkProtocolLei from './bunns/pink protocol lei.svg';
import superProtocolLei from './bunns/super protocol lei.svg';
import goldChainContributor from './bunns/gold chain contributor.svg';
import superChainContributor from './bunns/super chain contributor.svg';
import purpleCommunityScarf from './bunns/purple community scarf.svg';
import superCommunityScarf from './bunns/super community scarf.svg';
import alphaSnake from './bunns/alpha snake.svg';
import goldKeyMultisig from './bunns/gold key multisig.svg';
import preserverOfWisdom from './bunns/preserver of wisdom.svg';
import { XPFieldset } from './XPFieldset';
import { GeneratedSections } from './GeneratedSections';

type BunnProps = {
  imageData: any;
  title: string;
};
function Bunn({ imageData, title }: BunnProps) {
  // One line per word
  const renderedTitle = useMemo(() => {
    const parts = title.split(' ');
    let result: JSX.Element[] = [];
    parts.forEach((part, i) => {
      result.push(<span key={`${i}-span`}>{part}</span>);
      result.push(<br key={`${i}-br`} />);
    });
    return result;
  }, [title]);
  return (
    <figure className={styles.bunn}>
      <Image src={imageData} alt="" />
      <figcaption>{renderedTitle}</figcaption>
    </figure>
  );
}

export function CommunityInfo() {
  return (
    <div className={styles.wrapper}>
      <GeneratedSections />

      <div className={styles.section}>
        <h2>Special Accessories</h2>
        <p className={styles.explanation}>
          XP-based accessories are automatically awarded as you earn XP in
          different categories, and upgrade to Super when you earn 4XP a given
          category.
        </p>
        <div className={styles.xp}>
          <XPFieldset kind="activity">
            <div className={styles.bunns}>
              <Bunn imageData={pinkProtocolLei} title="Pink Protocol Lei" />
              <Bunn imageData={superProtocolLei} title="Super Protocol Lei" />
            </div>
          </XPFieldset>
          <XPFieldset kind="contributor">
            <div className={styles.bunns}>
              <Bunn
                imageData={goldChainContributor}
                title="Gold Chain Contributor"
              />
              <Bunn
                imageData={superChainContributor}
                title="Super Chain Contributor"
              />
            </div>
          </XPFieldset>
          <XPFieldset kind="community">
            <div className={styles.bunns}>
              <Bunn
                imageData={purpleCommunityScarf}
                title="Purple Community Scarf"
              />
              <Bunn
                imageData={superCommunityScarf}
                title="Super Community Scarf"
              />
            </div>
          </XPFieldset>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Role-based Accessories</h2>
        <p className={styles.explanation}>
          Role-based accessories are awarded via a nomination process. Use this
          form to nominate. If you have an idea for a trait that doesn&apos;t
          exist, suggest it on Github.
        </p>
        <div className={styles['xp-wide']}>
          <Fieldset legend="">
            <div className={styles.bunns}>
              <Bunn imageData={alphaSnake} title="Alpha Snake" />
              <Bunn imageData={goldKeyMultisig} title="Gold Key Multisig" />
              <Bunn imageData={preserverOfWisdom} title="Preserver of Wisdom" />
            </div>
          </Fieldset>
        </div>
      </div>
    </div>
  );
}
