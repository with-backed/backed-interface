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
  const { data: account } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (account && account.address) {
      router.push(`/community/${account.address}`);
    }
  }, [account, router]);
  return <CommunityPage />;
}
