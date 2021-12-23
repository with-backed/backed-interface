import React from 'react';
import styles from './DescriptionList.module.css';

interface DescriptionListProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDListElement>,
    HTMLDListElement
  > {
  orientation?: 'horizontal' | 'vertical';
  clamped?: boolean;
}

export const DescriptionList = ({
  children,
  orientation = 'vertical',
  clamped = false,
}: DescriptionListProps) => {
  const className = [styles[orientation], clamped ? styles.clamped : ''].join(
    ' ',
  );
  return <dl className={className}>{children}</dl>;
};
