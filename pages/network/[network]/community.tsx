import React from 'react';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL_MAP } from 'lib/constants';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  // Community page will be unavailable on prod until we launch
  if (process.env.VERCEL_ENV === 'production') {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
};

export default function Community() {
  const { network } = useConfig();
  return (
    <>
      <OpenGraph
        imageUrl={BUNNY_IMG_URL_MAP[network as SupportedNetwork]}
        title="Backed | Community"
        description="Mint or manage your Backed Community NFT"
      />
    </>
  );
}
