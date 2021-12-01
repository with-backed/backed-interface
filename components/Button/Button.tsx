import React, { ButtonHTMLAttributes, ComponentProps } from 'react';
import { DialogDisclosure } from 'reakit/Dialog';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}

export function DialogDisclosureButton({
  children,
  ...props
}: ComponentProps<typeof DialogDisclosure>) {
  return (
    <DialogDisclosure {...props} className={styles.button}>
      {children}
    </DialogDisclosure>
  );
}
