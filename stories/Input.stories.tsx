import React, { ChangeEvent, HTMLAttributes } from 'react';

import { Input } from 'components/Input';

export default {
  title: 'Components/Input',
  component: Input,
};

export const InputStyles = () => {
  return (
    <>
      <div
        style={{
          padding: 'var(--gap)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap)',
          backgroundColor: '#efefef',
        }}>
        <Input title="default input" />
        <Input title="error input" placeholder="Neato" />
        <Input title="message input" value="Neato" />
      </div>
      <div
        style={{
          padding: 'var(--gap)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap)',
          backgroundColor: '#ffffff',
        }}>
        <Input color="dark" title="default input" />
        <Input color="dark" title="error input" placeholder="Neato" />
        <Input color="dark" title="message input" value="Neato" />
      </div>
    </>
  );
};
