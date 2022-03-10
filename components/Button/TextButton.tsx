import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonKind =
  | 'neutral'
  | 'clickable'
  | 'visited'
  | 'active'
  | 'alert'
  | 'success';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
}

export function TextButton({
  children,
  kind = 'neutral',
  ...props
}: ButtonProps) {
  const className = `text-button-${kind}`;
  return (
    <button className={styles[className]} {...props}>
      {children}
    </button>
  );
}
