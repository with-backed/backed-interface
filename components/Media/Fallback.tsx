import React, { useEffect, useMemo, useState } from 'react';
import styles from './Media.module.css';

const PAWN_SHOP_ITEMS = ['🎸', '💸', '🔭', '🎥', '🛵', '🏺', '💎', '💍'];
const getRandomItem = () => {
  return PAWN_SHOP_ITEMS[Math.floor(Math.random() * PAWN_SHOP_ITEMS.length)];
};

type FallbackProps = {
  small?: boolean;
};

export const Fallback = ({ small }: FallbackProps) => {
  const [item, setItem] = useState('');
  useEffect(() => {
    setItem(getRandomItem());
  }, [setItem]);
  return (
    <div
      aria-hidden="true"
      className={small ? styles.smallback : styles.fallback}>
      <span>{item}</span>
    </div>
  );
};
