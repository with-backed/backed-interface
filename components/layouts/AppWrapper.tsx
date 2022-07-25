import { useCommunityGradient } from 'hooks/useCommunityGradient';
import { useRouter } from 'next/router';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './AppWrapper.module.css';

function communityGradient(start: string, finish: string) {
  return `radial-gradient(
    52.94% 52.36% at 28.53% 25.3%,
    ${start} 26.04%,
    ${finish} 100%
  )`;
}

export const AppWrapper: FunctionComponent = ({ children }) => {
  const { pathname } = useRouter();
  const { from, to } = useCommunityGradient();

  const isCommunityPage = useMemo(
    () => pathname.startsWith('/community'),
    [pathname],
  );
  const computedStyles = useMemo(() => {
    if (isCommunityPage) {
      return {
        background: communityGradient(from, to),
      };
    }

    return {};
  }, [isCommunityPage, from, to]);

  return (
    <div
      className={
        isCommunityPage
          ? styles['app-wrapper-community']
          : styles['app-wrapper']
      }
      style={computedStyles}>
      {children}
    </div>
  );
};
