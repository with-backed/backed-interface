import React from 'react';

import { Marquee } from 'components/Marquee';

export default {
  title: 'Components/Marquee',
  component: Marquee,
};

export const MarqueeStyles = () => {
  return (
    <Marquee>
      <div>Greetings, fellows.</div>
      <div>
        This div has <a>a link in it</a>, isn&apos;t that cool?
      </div>
    </Marquee>
  );
};
