import React, { FunctionComponent } from 'react';
import style from './Column.module.css';

interface ColumnProps {}
export const Column: FunctionComponent<ColumnProps> = ({
  children,
  ...props
}) => {
  return (
    <div className={style.column} {...props}>
      {children}
    </div>
  );
};
