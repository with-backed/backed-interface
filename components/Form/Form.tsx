import React, { FormHTMLAttributes } from 'react';
import styles from './Form.module.css';

export function Form({
  children,
  autoComplete = 'off',
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={styles.form} autoComplete={autoComplete} {...props}>
      {children}
    </form>
  );
}
