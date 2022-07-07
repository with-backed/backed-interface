import React from 'react';
import { GetServerSideProps } from 'next';
import { CommunityAddressPage } from 'components/CommunityPageContent';
import { resolveEns } from 'lib/account';
import { configs } from 'lib/config';
import {
  AccessoryLookup,
  CommunityAccount,
  getAccessoryLookup,
  getCommunityAccountInfo,
} from 'lib/community';
import { COMMUNITY_NFT_SUBGRAPH } from 'lib/constants';

export const getServerSideProps: GetServerSideProps<
  CommunityAddressProps
> = async (context) => {
  // Community page will be unavailable on prod until we launch
  if (process.env.VERCEL_ENV === 'production') {
    return {
      notFound: true,
    };
  }

  const rawAddress = context.params?.address as string;
  const address =
    (await resolveEns(rawAddress, configs.ethereum.jsonRpcProvider)) ||
    rawAddress;

  const [account, accessoryLookup] = await Promise.all([
    getCommunityAccountInfo(address.toLowerCase(), COMMUNITY_NFT_SUBGRAPH),
    getAccessoryLookup(COMMUNITY_NFT_SUBGRAPH),
  ]);
  return {
    props: { account, address, accessoryLookup },
  };
};

type CommunityAddressProps = {
  address: string;
  account: CommunityAccount | null;
  accessoryLookup: AccessoryLookup;
};
export default function CommunityAddress({
  account,
  address,
  accessoryLookup,
}: CommunityAddressProps) {
  return (
    <CommunityAddressPage
      account={account}
      address={address}
      accessoryLookup={accessoryLookup}
    />
  );
}
