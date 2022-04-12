import { Custom500 } from 'components/Custom500';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Backed | 500</title>
      </Head>
      <PawnShopHeader isErrorPage={true} />
      <Custom500 />
    </>
  );
}
