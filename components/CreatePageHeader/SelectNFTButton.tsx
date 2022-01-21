import {
  Button,
  CompletedButton,
  DialogDisclosureButton,
} from 'components/Button';
import React from 'react';
import { DialogStateReturn } from 'reakit/Dialog';

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
    return <Button disabled>{text}</Button>;
  }

  if (done) {
    return <CompletedButton buttonText={text} success />;
  }

  return <DialogDisclosureButton {...dialog}>{text}</DialogDisclosureButton>;
}
