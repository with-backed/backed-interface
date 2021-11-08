import React, { FunctionComponent } from 'react';
import styles from './FormWrapper.module.css';

export const FormWrapper: FunctionComponent = ({ children }) => {
  return <div className={styles['form-wrapper']}>{children}</div>;
}
