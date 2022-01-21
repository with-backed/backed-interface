import React from 'react';
import { Checkmark } from 'components/Icons/Checkmark';
import styles from './Button.module.css';

interface CompletedButtonProps {
  buttonText: React.ReactNode;
  message?: React.ReactNode;
  success?: boolean;
  id?: string;
}

export function CompletedButton({
  buttonText,
  message,
  success = false,
  id,
}: CompletedButtonProps) {
  const className = [styles['button-completed'], styles.secondary].join(' ');
  return (
    <div id={id} className={className}>
      {buttonText}
      {!!message && (
        <div className={styles['button-completed-message']}>{message}</div>
      )}
      {success && (
        <div aria-hidden className={styles['button-completed-icon']}>
          <Checkmark />
        </div>
      )}
    </div>
  );
}
