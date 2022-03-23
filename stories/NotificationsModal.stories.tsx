import { NotificationsModal } from 'components/NotificationsModal';
import React from 'react';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';

export const NotificationsModalStyles = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <div>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <NotificationsModal profileAddress="" dialog={dialog} />
    </div>
  );
};

export default {
  title: 'Components/NotificationsModal',
  component: NotificationsModal,
};
