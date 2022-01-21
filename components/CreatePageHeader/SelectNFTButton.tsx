import {
  Button,
  CompletedButton,
  DialogDisclosureButton,
} from 'components/Button';
import React from 'react';
import { DialogStateReturn } from 'reakit/Dialog';

const ID = 'selectNFT';

type SelectNFTButtonProps = {
  disabled: boolean;
  done: boolean;
  dialog: DialogStateReturn;
};
export function SelectNFTButton({
  dialog,
  disabled,
  done,
}: SelectNFTButtonProps) {
  const text = 'Select an NFT';

  if (disabled) {
    return (
      <Button id={ID} disabled>
        {text}
      </Button>
    );
  }

  if (done) {
    return <CompletedButton id={ID} buttonText={text} success />;
  }

  return (
    <DialogDisclosureButton id={ID} {...dialog}>
      {text}
    </DialogDisclosureButton>
  );
}
