import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styles from './Marquee.module.css';

export const MarqueeSpacer = () => {
  return <div className={styles['spacer']} />;
};

export const Marquee: FunctionComponent = ({ children }) => {
  const [isPaused, setIsPaused] = useState(false);
  const className = useMemo(
    () => `${styles.scrolling} ${isPaused ? styles.paused : ''}`,
    [isPaused],
  );
  const handleClick = useCallback(() => {
    setIsPaused((state) => !state);
  }, [setIsPaused]);
  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={className}>{children}</div>
      <div className={className} aria-hidden={true}>
        {children}
      </div>
      <div className={className} aria-hidden={true}>
        {children}
      </div>
      <div className={className} aria-hidden={true}>
        {children}
      </div>
    </div>
  );
};
