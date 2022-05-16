import React from 'react';
import styles from './TwelveColumn.module.css';

type TwelveColumnProps = React.PropsWithChildren<{
  padded?: boolean;
}>;

export const TwelveColumn = React.forwardRef<HTMLDivElement, TwelveColumnProps>(
  ({ children, padded }, ref) => {
    return (
      <div className={padded ? styles['padded-grid'] : styles.grid} ref={ref}>
        {children}
      </div>
    );
  },
);

TwelveColumn.displayName = 'TwelveColumn';
