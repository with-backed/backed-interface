import { Toggle } from 'components/Toggle';
import React from 'react';

export default {
  title: 'components/Toggle',
  component: Toggle,
};

export const Toggles = () => {
  return (
    <Toggle
      handleChange={(checked) => console.log({ checked })}
      left="Left"
      right="Right"
    />
  );
};
