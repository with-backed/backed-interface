import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { CommunityPage } from 'components/CommunityPageContent';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  // Community page will be unavailable on prod until we launch
  if (process.env.VERCEL_ENV === 'production') {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
};

export default function Community() {
  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push(`/community/${address}`);
    }
  }, [address, router]);
  return <CommunityPage />;
}
