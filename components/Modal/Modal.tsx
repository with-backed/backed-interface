import styles from './Modal.module.css';

export function Modal({ children }: { children: any }) {
  return <div className={styles.modalWrapper}>{children}</div>;
}
