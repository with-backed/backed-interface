import React, { FunctionComponent } from 'react';

import styles from './FiveColumn.module.css';

export const FiveColumn: FunctionComponent = ({ children }) => (
  <div className={styles.grid}>{children}</div>
);
