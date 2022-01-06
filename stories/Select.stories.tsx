import React from 'react';

import { Select } from 'components/Select';

export default {
  title: 'Components/Select',
  component: Select,
};

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

export const SelectStyles = () => {
  return <Select placeholder="Flavor" options={options} />;
};
