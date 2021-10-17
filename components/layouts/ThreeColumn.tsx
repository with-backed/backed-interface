import React, { FunctionComponent } from 'react';

import styles from './ThreeColumn.module.css';

const ThreeColumn: FunctionComponent = ({ children }) => (
  <div className={styles.grid}>{children}</div>
);

export default ThreeColumn;
