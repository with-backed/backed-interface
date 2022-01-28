import React, { FormHTMLAttributes } from 'react';
import styles from './Form.module.css';

export function Form({
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={styles.form} {...props}>
      {children}
    </form>
  );
}
