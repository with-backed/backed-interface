import { Custom404 } from 'components/Custom404';
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Backed | 404</title>
      </Head>
      <PawnShopHeader isErrorPage={true} />
      <Custom404 />
    </>
  );
}
