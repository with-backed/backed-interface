import React, { ChangeEvent } from 'react';

import { Input } from 'components/Input';

export default {
  title: 'Components/Input',
  component: Input,
};

const handleChange = (_event: ChangeEvent<HTMLInputElement>) => { };

export const InputStyles = () => {
  return (
    <>
      <Input title="default input" value="Neato" onChange={handleChange} />
      <Input title="error input" value="Neato" error="Not Neat" onChange={handleChange} />
      <Input title="message input" value="Neato" message="Yup" onChange={handleChange} />
    </>
  );
}
