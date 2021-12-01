import React from 'react';
import { Modal } from 'components/Modal';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';

export default {
  title: 'Components/Modal',
  component: Modal,
};

export const ModalStyles = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <div>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <Modal heading="The Storybook Modal" dialog={dialog}>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
        <p>yote</p>
      </Modal>
    </div>
  );
};
