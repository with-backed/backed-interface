import React from 'react';
import { OpenGraph } from 'components/OpenGraph';
import { BUNNY_IMG_URL_MAP } from 'lib/constants';
import { HeaderInfo } from 'components/HeaderInfo';

export default function About() {
  return (
    <>
      <OpenGraph
        imageUrl={BUNNY_IMG_URL_MAP['ethereum']}
        title="Backed | About"
        description="Learn how Backed protocol works"
      />
      <HeaderInfo isCollapsed={false} />
    </>
  );
}
