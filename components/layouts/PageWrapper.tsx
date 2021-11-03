import React, { FunctionComponent } from 'react';
import styles from './PageWrapper.module.css';

export const PageWrapper: FunctionComponent = ({ children }) => {
  return <div className={styles['page-wrapper']}>{children}</div>
}
