import React from 'react';
import { ButtonKind } from './Button';
import styles from './Button.module.css';

interface CompletedButtonProps {
  buttonText: React.ReactNode;
  kind?: ButtonKind;
  message?: React.ReactNode;
  success?: boolean;
}

export function CompletedButton({
  buttonText,
  kind = 'primary',
  message,
  success = false,
}: CompletedButtonProps) {
  const className = [styles['button-completed'], styles[kind]].join(' ');
  return (
    <div className={className}>
      {buttonText}
      {!!message && (
        <div className={styles['button-completed-message']}>{message}</div>
      )}
      {success && (
        <div aria-hidden className={styles['button-completed-icon']}>
          ✓
        </div>
      )}
    </div>
  );
}
