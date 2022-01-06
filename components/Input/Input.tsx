import React, { FunctionComponent, InputHTMLAttributes } from 'react';

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: 'light' | 'dark';
}

export const Input: FunctionComponent<InputProps> = ({
  color = 'light',
  ...props
}) => {
  return <input className={styles[color]} {...props} />;
};
