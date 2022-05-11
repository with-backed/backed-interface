import { Arrow } from 'components/Icons/Arrow';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'reakit/Button';
import styles from './Carousel.module.css';
import { slides } from './slides';

/**
 * The `%` operator in JS doesn't do what you want with negative numbers.
 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function Carousel() {
  const [index, setIndex] = useState(0);

  const goBack = useCallback(
    () => setIndex((prev) => mod(--prev, slides.length)),
    [],
  );
  const goForward = useCallback(
    () => setIndex((prev) => mod(++prev, slides.length)),
    [],
  );
  return (
    <div className={styles.carousel}>
      <img className={styles.image} src={slides[index].image} alt="" />
      <div className={styles['mobile-controls']}>
        <div>
          <ArrowButton orientation="left" onClick={goBack} />
          <ArrowButton orientation="right" onClick={goForward} />
        </div>
        <p>{slides[index].text}</p>
      </div>
      <div className={styles.controls}>
        <ArrowButton orientation="left" onClick={goBack} />
        <p>{slides[index].text}</p>
        <ArrowButton orientation="right" onClick={goForward} />
      </div>
      <div className={styles.progress}>
        {slides.map((_, i) => (
          <ProgressIndicator
            key={i}
            done={i <= index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

type ArrowButtonProps = {
  onClick: () => void;
  orientation: 'left' | 'right';
};
function ArrowButton({ onClick, orientation }: ArrowButtonProps) {
  const className = useMemo(() => {
    let classes: string[] = [styles['arrow-button']];

    if (orientation === 'right') {
      classes.push(styles['arrow-button-right']);
    }

    return classes.join(' ');
  }, [orientation]);

  return (
    <Button
      aria-label={`Advance slide ${orientation}`}
      onClick={onClick}
      className={className}>
      <Arrow />
    </Button>
  );
}

type ProgressIndicatorProps = {
  done?: boolean;
  onClick?: () => void;
};
function ProgressIndicator({ done, onClick }: ProgressIndicatorProps) {
  return (
    <div
      onClick={onClick}
      className={done ? styles.indicator : styles['indicator-awaiting']}
    />
  );
}
