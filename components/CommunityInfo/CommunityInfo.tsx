import { Fieldset } from 'components/Fieldset';
import { ShimmerPlus } from 'components/Icons/ShimmerPlus';
import React, { FunctionComponent, useMemo } from 'react';
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

type XPKind = 'activity' | 'community' | 'contributor';

const titleMap = {
  activity: 'Activity XP',
  community: 'Community XP',
  contributor: 'Contributor XP',
};

type LegendProps = {
  kind: XPKind;
};
function Legend({ kind }: LegendProps) {
  return (
    <h3 className={styles.legend}>
      <ShimmerPlus kind={kind} /> {titleMap[kind]}
    </h3>
  );
}

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

type XPFieldsetProps = {
  kind: XPKind;
};
const XPFieldset: FunctionComponent<XPFieldsetProps> = ({ kind, children }) => {
  return <Fieldset legend={<Legend kind={kind} />}>{children}</Fieldset>;
};

export function CommunityInfo() {
  return (
    <div className={styles.wrapper}>
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

      <div className={styles.section}>
        <h2>Special Traits</h2>
        <p className={styles.explanation}>
          XP-based traits are automatically awarded as you earn XP in different
          categories, and upgrade to Super when you earn 4XP a given category.
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
        <h2>Role-based Traits</h2>
        <p className={styles.explanation}>
          Role-based traits are awarded via a nomination process. Use this form
          to nominate. If you have an idea for a trait that doesn&apos;t exist,
          suggest it on Github.
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
