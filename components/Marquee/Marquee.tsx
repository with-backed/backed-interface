import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styles from './Marquee.module.css';

const MARQUEE_ITEM_COUNT = 10;

export const Marquee: FunctionComponent = ({ children }) => {
  const [isPaused, setIsPaused] = useState(false);
  const className = useMemo(
    () => `${styles.scrolling} ${isPaused ? styles.paused : ''}`,
    [isPaused],
  );
  const handleClick = useCallback(() => {
    setIsPaused((state) => !state);
  }, [setIsPaused]);
  const repetitions = useMemo(() => {
    return Array.from({ length: MARQUEE_ITEM_COUNT }, (_, i) => (
      <div className={className} key={i} aria-hidden>
        {children}
      </div>
    ));
  }, [children, className]);

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={className}>{children}</div>
      {repetitions}
    </div>
  );
};
