import React, {
  FunctionComponent,
  InputHTMLAttributes,
  useCallback,
  useRef,
} from 'react';

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: 'light' | 'dark';
  unit?: string;
}

export const Input: FunctionComponent<InputProps> = ({
  color = 'light',
  unit,
  ...props
}) => {
  const className = unit ? styles[`${color}-unit`] : styles[color];

  const inputRef = useRef<HTMLInputElement>(null);
  const handleWheel = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    // this stops the scroll event from changing the input (annoying)
    inputRef.current.blur();
    // this refocuses the input briefly after scrolling to prevent a different annoyance
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, []);

  if (unit) {
    return (
      <div className={styles.wrapper}>
        <input className={className} {...props} />
        <span className={styles.unit}>{unit}</span>
      </div>
    );
  }
  return (
    <input
      className={className}
      {...props}
      ref={inputRef}
      onWheel={handleWheel}
    />
  );
};
