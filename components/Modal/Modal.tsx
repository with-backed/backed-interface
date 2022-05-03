import { Dialog, DialogBackdrop, DialogStateReturn } from 'reakit/Dialog';
import styles from './Modal.module.css';
import React, { FunctionComponent } from 'react';
import { Button, TextButton } from 'components/Button';

type ModalProps = {
  dialog: DialogStateReturn;
  heading?: string;
  width?: 'regular' | 'narrow';
};
export const Modal: FunctionComponent<ModalProps> = ({
  children,
  dialog,
  heading,
  width = 'regular',
}) => {
  return (
    <DialogBackdrop className={styles.backdrop} {...dialog}>
      <Dialog
        tabIndex={0}
        aria-label={!!heading ? heading : ''}
        className={`${styles.dialog} ${styles[width]}`}
        {...dialog}
        modal>
        {Boolean(heading) && <h3 className={styles.heading}>{heading}</h3>}
        <div className={styles['desktop-close-button']}>
          <Button aria-label="Close modal" kind="circle" onClick={dialog.hide}>
            ×
          </Button>
        </div>
        <div className={styles['mobile-close-button']}>
          <TextButton onClick={dialog.hide} aria-label="Close modal">
            Close
          </TextButton>
        </div>
        <div className={styles['scroll-box']}>{children}</div>
      </Dialog>
    </DialogBackdrop>
  );
};
