import React from 'react';
import { GetServerSideProps } from 'next';
import { CommunityAddressPage } from 'components/CommunityPageContent';
import { resolveEns } from 'lib/account';
import { configs } from 'lib/config';

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
  return {
    props: { address },
  };
};

type CommunityAddressProps = {
  address: string;
};
export default function CommunityAddress({ address }: CommunityAddressProps) {
  return <CommunityAddressPage address={address} />;
}
