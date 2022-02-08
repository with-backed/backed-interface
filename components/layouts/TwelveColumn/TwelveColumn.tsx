import React from 'react';
import styles from './TwelveColumn.module.css';

type TwelveColumnProps = React.PropsWithChildren<{
  padded?: boolean;
}>;

export const TwelveColumn = ({ children, padded }: TwelveColumnProps) => {
  return (
    <div className={padded ? styles['padded-grid'] : styles.grid}>
      {children}
    </div>
  );
};
