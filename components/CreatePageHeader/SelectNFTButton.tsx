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

  return (
    <DialogDisclosureButton id={ID} {...dialog}>
      {text}
    </DialogDisclosureButton>
  );
}
