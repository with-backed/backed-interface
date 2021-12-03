import React from 'react';

import {
  Button,
  DialogDisclosureButton,
  WalletButton,
} from 'components/Button';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';
import { FormWrapper } from 'components/layouts/FormWrapper';

export default {
  title: 'Components/Button',
  component: Button,
};

export const InputStyles = () => {
  return (
    <ThreeColumn>
      <Fieldset legend="buttons">
        <FormWrapper>
          <Button>Click here</Button>
          <DialogDisclosureButton>Click here for dialog</DialogDisclosureButton>
          <WalletButton wallet="Metamask" />
        </FormWrapper>
      </Fieldset>
    </ThreeColumn>
  );
};
