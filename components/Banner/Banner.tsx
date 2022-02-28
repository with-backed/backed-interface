import React, { useState } from 'react';
import styles from './Banner.module.css';

export type BannerKind = 'error' | 'success' | 'info';

type BannerProps = {
  kind: BannerKind;
  close?: () => void;
};

export function Banner({
  children,
  close,
  kind,
}: React.PropsWithChildren<BannerProps>) {
  return (
    <div className={styles[kind]}>
      <div className={styles.inner}>{children}</div>
      <button
        aria-label="close message"
        className={styles.close}
        onClick={close}>
        ×
      </button>
    </div>
  );
}
