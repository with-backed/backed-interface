import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { GetServerSideProps } from 'next';
import { SupportedNetwork, validateNetwork } from 'lib/config';
import { captureException } from '@sentry/nextjs';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL_MAP } from 'lib/constants';
import { useConfig } from 'hooks/useConfig';
import capitalize from 'lodash/capitalize';

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  try {
    validateNetwork(context.params!);
  } catch (e) {
    captureException(e);
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
};

export default function Create() {
  const { network } = useConfig();
  return (
    <>
      <OpenGraph
        title={`Backed | ${capitalize(network)} | Create a Loan`}
        description="Collateralize your NFT with Backed protocol."
        imageUrl={BUNNY_IMG_URL_MAP[network as SupportedNetwork]}
      />
      <PawnShopHeader />
      <CreatePageHeader />
    </>
  );
}
