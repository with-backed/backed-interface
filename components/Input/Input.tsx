import React, { FunctionComponent, InputHTMLAttributes } from 'react';

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: 'light' | 'dark';
  unit?: string;
}

export const Input: FunctionComponent<InputProps> = ({
  color = 'light',
  unit,
  ...props
}) => {
  const className = unit ? styles[`${color}-unit`] : styles[color];

  if (unit) {
    return (
      <div className={styles.wrapper}>
        <input className={className} {...props} />
        <span className={styles.unit}>{unit}</span>
      </div>
    );
  }
  return <input className={className} {...props} />;
};
