import React, { ChangeEvent } from 'react';

import { Marquee } from 'components/Marquee';
import { MarqueeSpacer } from 'components/Marquee/Marquee';

export default {
  title: 'Components/Marquee',
  component: Marquee,
};
const displayText =
  '🭹🭹🭹🭹 this is some text 🭹🭹🭹 so is this 🭹🭹🭹 here is somewhat longer text for testing purposes 🭹🭹🭹🭹';
export const MarqueeStyles = () => {
  return <Marquee>{displayText}</Marquee>;
};
