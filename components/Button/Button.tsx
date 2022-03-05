import React, { ButtonHTMLAttributes, ComponentProps } from 'react';
import { DialogDisclosure } from 'reakit/Dialog';
import { Disclosure } from 'reakit/Disclosure';
import styles from './Button.module.css';

export type ButtonKind =
  | 'primary'
  | 'primary-dark-bg'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'highlight'
  | 'white';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
}

export function Button({ children, kind = 'primary', ...props }: ButtonProps) {
  return (
    <button className={styles[kind]} {...props}>
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
  return (
    <DialogDisclosure {...props} className={styles[kind]}>
      {children}
    </DialogDisclosure>
  );
}

interface DisclosureButtonProps extends ComponentProps<typeof Disclosure> {
  kind?: ButtonKind;
}

export function DisclosureButton({
  children,
  kind = 'primary',
  ...rest
}: DisclosureButtonProps) {
  return (
    <Disclosure as={'button'} className={styles[kind]} {...rest}>
      {children}
    </Disclosure>
  );
}
