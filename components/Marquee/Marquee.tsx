import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styles from './Marquee.module.css';

const MARQUEE_ITEM_COUNT = 2;

type MarqueeProps = {
  messages: React.ReactNode[];
  startsPaused?: boolean;
};
export const Marquee: FunctionComponent<MarqueeProps> = ({
  messages,
  startsPaused = true,
}) => {
  const [isStopped, setIsStopped] = useState(startsPaused);

  const toggleStopped = useCallback(() => {
    setIsStopped((state) => !state);
  }, [setIsStopped]);

  const className = useMemo(
    () => `${styles.scrolling} ${isStopped ? styles.paused : ''}`,
    [isStopped],
  );
  const formattedMessages = useMemo(() => {
    return messages.map((message, index) => <span key={index}>{message}</span>);
  }, [messages]);
  const repetitions = useMemo(() => {
    return Array.from({ length: MARQUEE_ITEM_COUNT }, (_, i) => (
      <div className={className} key={i} aria-hidden>
        <div className={styles.wrapper}>{formattedMessages}</div>
      </div>
    ));
  }, [formattedMessages, className]);

  return (
    <div className={styles.container} onClick={toggleStopped}>
      <div className={className}>
        <div className={styles.wrapper}>{formattedMessages}</div>
      </div>
      {repetitions}
    </div>
  );
};
