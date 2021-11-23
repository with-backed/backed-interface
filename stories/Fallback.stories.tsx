import React from 'react';
import { Fallback } from 'components/Media/Fallback';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';

export default {
  title: 'components/Media/Fallback',
  component: Fallback,
};

export const FieldsetStyles = () => {
  return (
    <ThreeColumn>
      <Fieldset legend="a fallback image">
        <Fallback />
      </Fieldset>
      <Fieldset legend="a fallback image">
        <Fallback />
      </Fieldset>
      <Fieldset legend="a fallback image">
        <Fallback />
      </Fieldset>
    </ThreeColumn>
  );
};
