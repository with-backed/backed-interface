import { Dialog, DialogStateReturn } from 'reakit/Dialog';
import styles from './Modal.module.css';
import React, { FunctionComponent } from 'react';

type ModalProps = {
  dialog: DialogStateReturn;
  heading?: string;
};
export const Modal: FunctionComponent<ModalProps> = ({
  children,
  dialog,
  heading,
}) => {
  return (
    <Dialog className={styles.dialog} {...dialog}>
      {heading && <h3 className={styles.heading}>{heading}</h3>}
      <div className={styles['scroll-box']}>{children}</div>
    </Dialog>
  );
};
