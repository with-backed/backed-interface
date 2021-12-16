import React from 'react';
import styles from './DescriptionList.module.css';

interface DescriptionListProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDListElement>,
    HTMLDListElement
  > {}

export const DescriptionList = ({ children }: DescriptionListProps) => {
  return <dl className={styles.dl}>{children}</dl>;
};
