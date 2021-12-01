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
  initialStoppedState?: boolean;
};
export const Marquee: FunctionComponent<MarqueeProps> = ({
  messages,
  initialStoppedState = false,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(initialStoppedState);

  const toggleStopped = useCallback(() => {
    setIsStopped((state) => !state);
  }, [setIsStopped]);
  const togglePaused = useCallback(() => {
    setIsPaused((state) => !state);
  }, [setIsPaused]);

  const className = useMemo(
    () => `${styles.scrolling} ${isPaused || isStopped ? styles.paused : ''}`,
    [isPaused, isStopped],
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
    <div
      className={styles.container}
      onClick={toggleStopped}
      onMouseEnter={togglePaused}
      onMouseLeave={togglePaused}>
      <div className={className}>
        <div className={styles.wrapper}>{formattedMessages}</div>
      </div>
      {repetitions}
    </div>
  );
};
