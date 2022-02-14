import React, { useEffect, useMemo, useState } from 'react';
import styles from './Media.module.css';

const PAWN_SHOP_ITEMS = ['🎸', '💸', '🔭', '🎥', '🛵', '🏺', '💎', '💍'];
const getRandomItem = () => {
  return PAWN_SHOP_ITEMS[Math.floor(Math.random() * PAWN_SHOP_ITEMS.length)];
};

type FallbackProps = {
  small?: boolean;
  animated?: boolean;
};

export const Fallback = ({ animated = true, small }: FallbackProps) => {
  const [item, setItem] = useState('');
  useEffect(() => {
    setItem(getRandomItem());
  }, [setItem]);

  const className = useMemo(() => {
    if (small) {
      return styles.smallback;
    }

    if (animated) {
      return styles['fallback-animated'];
    }

    return styles.fallback;
  }, [animated, small]);
  return (
    <div aria-hidden="true" className={className}>
      <span>{item}</span>
    </div>
  );
};
