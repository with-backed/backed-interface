import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { GetServerSideProps } from 'next';
import { validateNetwork } from 'lib/config';
import { captureException } from '@sentry/nextjs';
import { OpenGraph } from 'components/OpenGraph';

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
        imageUrl="https://github.com/with-backed/backed-interface/blob/main/components/Logo/backed-bunny.png?raw=true"
      />
      <PawnShopHeader />
      <CreatePageHeader />
    </>
  );
}
