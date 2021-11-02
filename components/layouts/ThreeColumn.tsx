import React, { FunctionComponent } from 'react';

import styles from './ThreeColumn.module.css';

export const ThreeColumn: FunctionComponent = ({ children }) => (
  <div className={styles.grid}>{children}</div>
);
