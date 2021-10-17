import React, { FunctionComponent } from 'react';

export const GridItem: FunctionComponent = ({ children }) => (
  <div
    style={{
      backgroundColor: 'wheat',
      height: '250px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3em',
      fontWeight: 'bold',
    }}
  >
    {children}
  </div>
);
