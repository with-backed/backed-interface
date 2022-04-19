import { Button, DialogDisclosureButton } from 'components/Button';
import React from 'react';
import { DialogStateReturn } from 'reakit/Dialog';

const ID = 'selectNFT';

type SelectNFTButtonProps = {
  state: 'disabled' | 'active' | 'selected';
  dialog: DialogStateReturn;
};
export function SelectNFTButton({ dialog, state }: SelectNFTButtonProps) {
  const text = 'Select an NFT';

  if (state === 'disabled') {
    return (
      <Button id={ID} disabled>
        {text}
      </Button>
    );
  }

  return (
    <DialogDisclosureButton
      kind={state === 'active' ? 'primary' : 'secondary'}
      id={ID}
      {...dialog}>
      {text}
    </DialogDisclosureButton>
  );
}
