import React from 'react';
import { Fieldset } from 'components/Fieldset';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { FormWrapper } from 'components/layouts/FormWrapper';

export default {
  title: 'components/Fieldset',
  component: Fieldset,
};

export const FieldsetStyles = () => {
  return (
    <Fieldset legend="Storybook Fieldset">
      <FormWrapper>
        <Input title="an input" onChange={() => {}} />
        <Input title="another input" onChange={() => {}} />
        <Button>Don't do anything</Button>
      </FormWrapper>
    </Fieldset>
  );
};
