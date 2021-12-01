import React from 'react';

import { Marquee } from 'components/Marquee';

export default {
  title: 'Components/Marquee',
  component: Marquee,
};

const messages = [
  'this is some text',
  'so is this',
  'here is somewhat longer text for testing purposes',
];

export const MarqueeStyles = () => {
  return <Marquee messages={messages} />;
};
