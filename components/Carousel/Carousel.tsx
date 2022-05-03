import { Arrow } from 'components/Icons/Arrow';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'reakit/Button';
import styles from './Carousel.module.css';
import { slides } from './slides';

export function Carousel() {
  const [index, setIndex] = useState(0);

  const goBack = useCallback(() => setIndex((prev) => Math.max(--prev, 0)), []);
  const goForward = useCallback(
    () => setIndex((prev) => Math.min(++prev, slides.length - 1)),
    [],
  );
  return (
    <div className={styles.carousel}>
      <img className={styles.image} src={slides[index].image} alt="" />
      <div className={styles.controls}>
        <ArrowButton
          orientation="left"
          onClick={goBack}
          disabled={index === 0}
        />
        <p>{slides[index].text}</p>
        <ArrowButton
          orientation="right"
          onClick={goForward}
          disabled={index === slides.length - 1}
        />
      </div>
      <div className={styles.progress}>
        {slides.map((_, i) => (
          <ProgressIndicator key={i} done={i <= index} />
        ))}
      </div>
    </div>
  );
}

type ArrowButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  orientation: 'left' | 'right';
};
function ArrowButton({ disabled, onClick, orientation }: ArrowButtonProps) {
  const className = useMemo(() => {
    let classes: string[] = [styles['arrow-button']];

    if (disabled) {
      classes.push(styles['arrow-button-disabled']);
    }

    if (orientation === 'right') {
      classes.push(styles['arrow-button-right']);
    }

    return classes.join(' ');
  }, [disabled, orientation]);

  return (
    <Button onClick={onClick} disabled={disabled} className={className}>
      <Arrow />
    </Button>
  );
}

type ProgressIndicatorProps = {
  done?: boolean;
};
function ProgressIndicator({ done }: ProgressIndicatorProps) {
  return (
    <div className={done ? styles.indicator : styles['indicator-awaiting']} />
  );
}
