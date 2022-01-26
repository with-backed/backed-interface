import React, { InputHTMLAttributes } from 'react';

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: 'light' | 'dark';
  unit?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ color = 'light', unit, ...props }, ref) => {
    const className = unit ? styles[`${color}-unit`] : styles[color];

    if (unit) {
      return (
        <div className={styles.wrapper}>
          <input className={className} {...props} ref={ref} />
          <span className={styles.unit}>{unit}</span>
        </div>
      );
    }
    return <input className={className} {...props} ref={ref} />;
  },
);
Input.displayName = 'Input';
