import React from 'react';
import { GetServerSideProps } from 'next';
import { CommunityAddressPage } from 'components/CommunityPageContent';

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
  return <CommunityAddressPage address="" />;
}
