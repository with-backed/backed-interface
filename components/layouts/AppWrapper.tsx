import { useRouter } from 'next/router';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './AppWrapper.module.css';

export const AppWrapper: FunctionComponent = ({ children }) => {
  const { pathname } = useRouter();

  const isCommunityPage = useMemo(
    () => pathname.endsWith('community'),
    [pathname],
  );
  return (
    <div
      className={
        isCommunityPage
          ? styles['app-wrapper-community']
          : styles['app-wrapper']
      }>
      {children}
    </div>
  );
};
