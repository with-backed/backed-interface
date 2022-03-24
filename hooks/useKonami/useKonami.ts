import { useEffect, useState } from 'react';

const konami = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
  'Enter',
];

export function useKonami() {
  const [index, setIndex] = useState(0);
  const [codeActive, setCodeActive] = useState(false);

  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent) {
      setIndex((prev) => {
        if (ev.code === konami[prev]) {
          return ++prev;
        }
        return 0;
      });
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (index >= konami.length) {
      setIndex(0);
      setCodeActive((prev) => !prev);
    }
  }, [index]);

  return codeActive;
}
