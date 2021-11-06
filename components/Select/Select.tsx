import React, { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = ({ title, ...props }: SelectProps) => {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        {title}
        <select
          className={styles.select}
          {...props}
        />
      </label>
    </div>
  );
};
