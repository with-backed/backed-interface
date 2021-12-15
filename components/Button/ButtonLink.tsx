import React, { ComponentProps } from 'react';
import Link from 'next/link';
import { ButtonKind } from './Button';
import styles from './Button.module.css';

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  kind: ButtonKind;
}

export function ButtonLink({ children, kind, ...props }: ButtonLinkProps) {
  const className = [styles[kind], styles['button-link']].join(' ');
  return (
    <Link {...props}>
      <a className={className}>{children}</a>
    </Link>
  );
}
