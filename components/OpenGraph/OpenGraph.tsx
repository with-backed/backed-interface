import { useConfig } from 'hooks/useConfig';
import Head from 'next/head';
import { useRouter } from 'next/router';

type OpenGraphProps = {
  imageUrl: string;
  title: string;
  type?: 'website' | 'profile';
  description?: string;
};

export function OpenGraph({
  imageUrl,
  title,
  type = 'website',
  description,
}: OpenGraphProps) {
  const { siteUrl } = useConfig();
  const { pathname } = useRouter();
  return (
    <Head>
      <meta property="og:title" content={title} />
      <title>{title}</title>
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl + pathname} />
      <meta property="og:image" content={imageUrl} />
      {!!description && (
        <>
          <meta property="og:description" content={description} />
          <meta name="description" content={description} />
        </>
      )}
    </Head>
  );
}
