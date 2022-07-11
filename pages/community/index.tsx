import React, { useEffect } from 'react';
import { CommunityPage } from 'components/CommunityPageContent';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

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
