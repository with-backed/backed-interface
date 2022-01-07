import React from 'react';
import styles from './FormErrors.module.css';

type FormErrorsProps = {
  errors?: string[];
};

export function FormErrors({ errors }: FormErrorsProps) {
  if (!errors || errors.length === 0) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <p>
        The following errors must be corrected before the form can be submitted.
      </p>
      <ul>
        {errors.map((error) => {
          return <li key={error}>{error}</li>;
        })}
      </ul>
    </div>
  );
}
