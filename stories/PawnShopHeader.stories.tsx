import { PawnShopHeader } from 'components/PawnShopHeader';
import React from 'react';

export default {
  title: 'Components/PawnShopHeader',
  component: PawnShopHeader,
};

export const HeaderStyles = () => {
  return (
    <div>
      <PawnShopHeader messages={['yote', 'yote', 'yote', 'yote']} />
      <PawnShopHeader
        messages={['yote', 'yote', 'yote', 'yote']}
        marqueeStoppedByDefault={true}
      />
    </div>
  );
};
