import { Button } from 'components/Button';
import { Form } from 'components/Form';
import { Input } from 'components/Input';
import { Modal } from 'components/Modal';
import React from 'react';
import { DialogStateReturn } from 'reakit/Dialog';
import styles from './NotificationsModal.module.css';

type NotificationsModalProps = {
  dialog: DialogStateReturn;
};

/**
 * TODO: use react-hook-form and handle subscribe action when API is ready
 */
export const NotificationsModal = ({ dialog }: NotificationsModalProps) => {
  return (
    <Modal heading="🔔 Subscribe to updates 📪️" dialog={dialog}>
      <Form>
        <div>
          Enter an email address to receive a notification when new activity
          happens on a loan this address is party to, or such a loan is within
          24 hours of coming due.
        </div>
        <Input
          name="emailAddress"
          color="dark"
          placeholder="Enter email address"
        />
        <div className={styles['button-row']}>
          <Button kind="tertiary" onClick={dialog.toggle}>
            Cancel
          </Button>
          <Button>Subscribe</Button>
        </div>
      </Form>
    </Modal>
  );
};
