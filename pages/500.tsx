import { Custom500 } from 'components/Custom500';
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Backed | 500</title>
        <meta name="description" content="Something went wrong" />
      </Head>
      <Custom500 />
    </>
  );
}
