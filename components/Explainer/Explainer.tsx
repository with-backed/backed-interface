import React from 'react';
import styles from './Explainer.module.css';

interface ExplainerProps {
  top: number;
  children: React.ReactNode;
  display?: 'normal' | 'error';
}

export function Explainer({
  children,
  display = 'normal',
  top,
}: ExplainerProps) {
  return (
    <div className={styles['explainer-container']} id="container">
      <div
        className={
          display === 'error' ? styles['explainer-error'] : styles.explainer
        }
        style={{ top }}>
        {children}
      </div>
    </div>
  );
}
