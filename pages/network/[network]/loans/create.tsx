import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { validateNetwork } from 'lib/validatePath';
import { captureException } from '@sentry/nextjs';

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
      <Head>
        <title>Backed | Create a Loan</title>
        <meta
          name="description"
          content="Collateralize your NFT with Backed protocol"
        />
      </Head>
      <PawnShopHeader />
      <CreatePageHeader />
    </>
  );
}
