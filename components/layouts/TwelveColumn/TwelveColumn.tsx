import React, { FunctionComponent } from 'react';
import styles from './TwelveColumn.module.css';

export const TwelveColumn: FunctionComponent = ({ children }) => {
  return <div className={styles.grid}>{children}</div>;
};
