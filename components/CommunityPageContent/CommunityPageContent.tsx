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
import { CommunityAccount } from 'lib/community';
import { CommunityActivity } from 'components/CommunityActivity';

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
  account: CommunityAccount | null;
};
export function CommunityAddressPage({
  account,
  address,
}: CommunityAddressPageProps) {
  const { network } = useConfig();
  console.log({ account });
  return (
    <div className={styles.container}>
      <OpenGraph
        // TODO: show actual NFT? Will need to convert to non-SVG format.
        imageUrl={BUNNY_IMG_URL_MAP[network as SupportedNetwork]}
        title={`Backed | Community Profile for ${address}`}
        description="View this Community profile"
      />
      <CommunityHeader account={account} address={address} />
      <CommunityActivity account={account} />
      <CommunityInfo />
    </div>
  );
}
