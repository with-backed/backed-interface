import React from 'react';
import {
  Button,
  CompletedButton,
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
          <Button kind="primary">Primary Button</Button>
          <Button kind="secondary">Secondary Button</Button>
          <Button kind="tertiary">Tertiary Button</Button>
          <Button kind="highlight">Highlight Button</Button>
          <Button disabled>Inactive Button</Button>
        </FormWrapper>
      </Fieldset>
      <Fieldset legend="Other buttons">
        <FormWrapper>
          <DialogDisclosureButton>Click here for dialog</DialogDisclosureButton>
          <CompletedButton
            buttonText="Authorize NFT"
            message={
              <span>
                Pending... <a href="https://google.com">View transaction</a>
              </span>
            }
          />
          <CompletedButton
            buttonText="Authorize NFT"
            success
            message={
              <span>
                Complete! <a href="https://google.com">View transaction</a>
              </span>
            }
          />
        </FormWrapper>
      </Fieldset>
      <Fieldset legend="Wallet buttons">
        <FormWrapper>
          <WalletButton wallet="MetaMask" />
          <WalletButton wallet="Coinbase Wallet" />
          <WalletButton wallet="Wallet Connect" />
        </FormWrapper>
      </Fieldset>
    </ThreeColumn>
  );
};
