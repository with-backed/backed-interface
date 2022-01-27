import { Dialog, DialogStateReturn } from 'reakit/Dialog';
import styles from './Modal.module.css';
import React, { FunctionComponent } from 'react';

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
    <Dialog
      tabIndex={0}
      aria-label={!!heading ? heading : ''}
      className={`${styles.dialog} ${styles[width]}`}
      {...dialog}
      modal={false}>
      {Boolean(heading) && <h3 className={styles.heading}>{heading}</h3>}
      <div className={styles['scroll-box']}>{children}</div>
    </Dialog>
  );
};
