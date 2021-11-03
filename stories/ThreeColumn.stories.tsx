import React from 'react';

import { GridItem } from './helpers';
import { ThreeColumn } from '../components/layouts/ThreeColumn';

export default {
  title: 'layouts/ThreeColumn',
  component: ThreeColumn,
};

export const LayoutEmpty = () => <ThreeColumn />;

export const LayoutThreeItems = () => (
  <ThreeColumn>
    {[1, 2, 3].map((index) => (
      <GridItem key={index}>{index}</GridItem>
    ))}
  </ThreeColumn>
);

export const LayoutFiveItems = () => (
  <ThreeColumn>
    {[1, 2, 3, 4, 5].map((index) => (
      <GridItem key={index}>{index}</GridItem>
    ))}
  </ThreeColumn>
);
