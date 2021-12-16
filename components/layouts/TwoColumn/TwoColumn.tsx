import React, { FunctionComponent } from 'react';

import styles from './TwoColumn.module.css';

export const TwoColumn: FunctionComponent = ({ children }) => (
  <div className={styles.grid}>{children}</div>
);
