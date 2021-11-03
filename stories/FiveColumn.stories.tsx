import React from 'react';

import { GridItem } from './helpers';
import { FiveColumn } from '../components/layouts/FiveColumn';

export default {
  title: 'layouts/FiveColumn',
  component: FiveColumn,
};

export const LayoutEmpty = () => <FiveColumn />;

export const LayoutThreeItems = () => (
  <FiveColumn>
    {[1, 2, 3].map((index) => (
      <GridItem key={index}>{index}</GridItem>
    ))}
  </FiveColumn>
);

export const LayoutFiveItems = () => (
  <FiveColumn>
    {[1, 2, 3, 4, 5].map((index) => (
      <GridItem key={index}>{index}</GridItem>
    ))}
  </FiveColumn>
);
