import React, { ChangeEvent } from 'react';

import { Select } from 'components/Select';

export default {
  title: 'Components/Select',
  component: Select,
};

const handleChange = (_event: ChangeEvent<HTMLSelectElement>) => { };

export const SelectStyles = () => {
  return (
    <Select title="Breakfast ingredients" onChange={handleChange}>
      <option>Bacon</option>
      <option>Eggs</option>
      <option>Jam</option>
    </Select>
  );
}
