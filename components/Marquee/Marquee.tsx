import React, { FunctionComponent, useMemo } from 'react';
import styles from './Marquee.module.css';

export const MarqueeSpacer = () => {
  return <div className={styles['spacer']} />;
};

export const Marquee: FunctionComponent = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.scrolling}>{children}</div>
      <div className={styles.scrolling} aria-hidden={true}>
        {children}
      </div>
      <div className={styles.scrolling} aria-hidden={true}>
        {children}
      </div>
      <div className={styles.scrolling} aria-hidden={true}>
        {children}
      </div>
    </div>
  );
};
