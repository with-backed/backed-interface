import React, { ButtonHTMLAttributes, ComponentProps } from 'react';
import { DialogDisclosure } from 'reakit/Dialog';
import styles from './Button.module.css';

export type ButtonKind = 'primary' | 'secondary' | 'tertiary' | 'highlight';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
}

export function Button({ children, kind = 'primary', ...props }: ButtonProps) {
  const className = [styles.button, styles[kind]].join(' ');
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}

interface DialogDisclosureButtonProps
  extends ComponentProps<typeof DialogDisclosure> {
  kind?: ButtonKind;
}

export function DialogDisclosureButton({
  children,
  kind = 'primary',
  ...props
}: DialogDisclosureButtonProps) {
  const className = [styles.button, styles[kind]].join(' ');
  return (
    <DialogDisclosure {...props} className={className}>
      {children}
    </DialogDisclosure>
  );
}
