import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';

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
      <CreatePageHeader />;
    </>
  );
}
