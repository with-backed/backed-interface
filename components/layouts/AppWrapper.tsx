import React, { FunctionComponent } from 'react';
import styles from './AppWrapper.module.css';

export const AppWrapper: FunctionComponent = ({ children }) => {
  return <div className={styles['app-wrapper']}>{children}</div>;
};
