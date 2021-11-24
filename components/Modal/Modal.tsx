import { HTMLAttributes } from 'react';
import styles from './Modal.module.css';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {}

export function Modal({ children }: ModalProps) {
  return <div className={styles.modalWrapper}>{children}</div>;
}
