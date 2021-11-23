import React, { useMemo } from 'react';
import styles from './Media.module.css';

const PAWN_SHOP_ITEMS = ['🎸', '💸', '🔭', '🎥', '🛵', '🏺', '💎', '💍'];
const getRandomItem = () => {
  return PAWN_SHOP_ITEMS[Math.floor(Math.random() * PAWN_SHOP_ITEMS.length)];
};

export const Fallback = () => {
  const item = useMemo(() => {
    return getRandomItem();
  }, []);
  return (
    <div aria-hidden="true" className={styles.fallback}>
      <span>{item}</span>
    </div>
  );
};
