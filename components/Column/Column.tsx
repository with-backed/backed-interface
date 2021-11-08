import React, { FunctionComponent } from 'react';

interface ColumnProps { };
export const Column: FunctionComponent<ColumnProps> = ({
  children,
  ...props
}) => {
  return (
    <div {...props}>
      {children}
    </div>
  );
};
