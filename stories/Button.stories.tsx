import React from 'react';
import {
  Button,
  ButtonLink,
  CompletedButton,
  DialogDisclosureButton,
  TextButton,
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
      <Fieldset legend="🔘 buttons">
        <FormWrapper>
          <Button kind="primary">Primary Button</Button>
          <Button kind="secondary">Secondary Button</Button>
          <Button kind="tertiary">Tertiary Button</Button>
          <Button kind="quaternary">Quaternary Button</Button>
          <Button kind="highlight">Highlight Button</Button>
          <Button disabled>Inactive Button</Button>
        </FormWrapper>
      </Fieldset>
      <Fieldset legend="🖱️ Other buttons">
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
          <ButtonLink kind="primary" href="https://google.com">
            Button Link
          </ButtonLink>
        </FormWrapper>
      </Fieldset>
      <Fieldset legend="📚 Text buttons">
        <FormWrapper>
          <TextButton>Neutral</TextButton>
          <TextButton kind="clickable">Clickable</TextButton>
          <TextButton kind="visited">Visited</TextButton>
          <TextButton kind="active">Active</TextButton>
          <TextButton kind="alert">Alert</TextButton>
          <TextButton kind="success">Success</TextButton>
        </FormWrapper>
      </Fieldset>
    </ThreeColumn>
  );
};
