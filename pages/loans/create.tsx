import React from 'react';
import { CreatePageHeader } from 'components/CreatePageHeader';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';

export default function Create() {
  return (
    <>
      <Head>
        <title>Backed | Create a Loan</title>
      </Head>
      <PawnShopHeader />
      <CreatePageHeader />;
    </>
  );
}
