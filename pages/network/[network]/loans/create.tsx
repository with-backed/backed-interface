import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { GetServerSideProps } from 'next';
import { validateNetwork } from 'lib/config';
import { captureException } from '@sentry/nextjs';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL } from 'lib/constants';

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
  return (
    <>
      <OpenGraph
        title="Backed | Create a Loan"
        description="Collateralize your NFT with Backed protocol."
        imageUrl={BUNNY_IMG_URL}
      />
      <PawnShopHeader />
      <CreatePageHeader />
    </>
  );
}
