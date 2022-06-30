import React from 'react';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL_MAP } from 'lib/constants';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import {
  CommunityHeaderDisconnected,
  CommunityHeader,
} from 'components/CommunityHeader';
import { CommunityInfo } from 'components/CommunityInfo';
import styles from './CommunityPageContent.module.css';

export function CommunityPage() {
  const { network } = useConfig();
  return (
    <div className={styles.container}>
      <OpenGraph
        imageUrl={BUNNY_IMG_URL_MAP[network as SupportedNetwork]}
        title="Backed | Community"
        description="Mint or manage your Backed Community NFT"
      />
      <CommunityHeaderDisconnected />
      <CommunityInfo />
    </div>
  );
}

type CommunityAddressPageProps = {
  address: string;
};
export function CommunityAddressPage({ address }: CommunityAddressPageProps) {
  const { network } = useConfig();
  return (
    <div className={styles.container}>
      <OpenGraph
        // TODO: show actual NFT? Will need to convert to non-SVG format.
        imageUrl={BUNNY_IMG_URL_MAP[network as SupportedNetwork]}
        title={`Backed | Community Profile for ${address}`}
        description="View this Community profile"
      />
      <CommunityHeader address={address} />
      <CommunityInfo />
    </div>
  );
}
