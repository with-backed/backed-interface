import React from 'react';

import Input from '../components/Input';

export default {
  title: 'Components/Input',
  component: Input,
};

const setValue = (_val: string) => { };

export const InputStyles = () => {
  return (
    <>
      <Input title="default input" value="Neato" setValue={setValue} />
      <Input title="error input" value="Neato" error="Not Neat" setValue={setValue} />
      <Input title="message input" value="Neato" message="Yup" setValue={setValue} />
    </>
  );
}
