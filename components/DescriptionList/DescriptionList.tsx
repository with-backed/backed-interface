import React from 'react';
import styles from './DescriptionList.module.css';

interface DescriptionListProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDListElement>,
    HTMLDListElement
  > {
  orientation?: 'horizontal' | 'vertical';
}

export const DescriptionList = ({
  children,
  orientation = 'vertical',
}: DescriptionListProps) => {
  return <dl className={styles[orientation]}>{children}</dl>;
};
