import React, { FieldsetHTMLAttributes } from 'react';
import styles from './Fieldset.module.css';

interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: React.ReactNode;
}
export function Fieldset({ children, legend, ...props }: FieldsetProps) {
  return (
    <fieldset className={styles['standard-fieldset']} {...props}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}
