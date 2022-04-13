import React, { ComponentProps, FunctionComponent } from 'react';
import ReactMarquee from 'react-fast-marquee';
import styles from './Marquee.module.css';

type MarqueeProps = ComponentProps<typeof ReactMarquee> & {};

export const Marquee: FunctionComponent<MarqueeProps> = ({
  children,
  className = styles.marquee,
}) => {
  return <ReactMarquee className={className}>{children}</ReactMarquee>;
};
