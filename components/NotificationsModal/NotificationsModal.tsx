import { Button } from 'components/Button';
import { Form } from 'components/Form';
import { Input } from 'components/Input';
import { Modal } from 'components/Modal';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DialogStateReturn } from 'reakit/Dialog';
import styles from './NotificationsModal.module.css';

type NotificationsModalProps = {
  profileAddress: string;
  dialog: DialogStateReturn;
};

type SubscribeToNotificationsFormData = {
  emailAddress: string;
};

/**
 * TODO: use react-hook-form and handle subscribe action when API is ready
 */
export const NotificationsModal = ({
  profileAddress,
  dialog,
}: NotificationsModalProps) => {
  const { addMessage } = useGlobalMessages();
  const [error, setError] = useState<string>('');

  const form = useForm<SubscribeToNotificationsFormData>({
    defaultValues: {
      emailAddress: '',
    },
  });

  const { handleSubmit, watch, register, setValue } = form;

  const { emailAddress } = watch();
  console.log(watch());

  const subscribeEmail = useCallback(async () => {
    const response = await fetch(
      `/api/addresses/${profileAddress}/notifications/emails/${emailAddress}`,
      {
        method: 'POST',
      },
    );
    if (response.status == 200) {
      addMessage({
        kind: 'success',
        message: `successfully subscribed ${emailAddress} to ${profileAddress}`,
      });
      setError('');
      setValue('emailAddress', '');
      dialog.toggle();
    } else {
      const { message } = await response.json();
      setError(message);
    }
  }, [profileAddress, addMessage, setValue, dialog, emailAddress]);

  return (
    <Modal heading="🔔 Subscribe to updates 📪️" dialog={dialog}>
      <Form onSubmit={handleSubmit(subscribeEmail)}>
        <div>
          Enter an email address to receive a notification when new activity
          happens on a loan this address is party to, or such a loan is within
          24 hours of coming due.
        </div>
        <Input
          id="emailAddress"
          type="text"
          color="dark"
          placeholder="Enter email address"
          {...register('emailAddress')}
        />
        {!!error && <div className={styles['error-message']}>{error}</div>}
        <div className={styles['button-row']}>
          <Button kind="tertiary" onClick={dialog.toggle}>
            Cancel
          </Button>
          <Button type="submit">Subscribe</Button>
        </div>
      </Form>
    </Modal>
  );
};
