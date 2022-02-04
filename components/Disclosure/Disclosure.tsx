import { Chevron } from 'components/Icons/Chevron';
import React, { useCallback, useMemo, useState } from 'react';
import {
  useDisclosureState,
  Disclosure as ReakitDisclosure,
  DisclosureContent,
} from 'reakit/Disclosure';
import styles from './Disclosure.module.css';

type DisclosureProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function Disclosure({ children, subtitle, title }: DisclosureProps) {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const disclosure = useDisclosureState({ visible: false });

  const handleClick = useCallback(() => {
    setHasBeenOpened(true);
    setIsOpen((prev) => !prev);
  }, [setHasBeenOpened]);

  const className = useMemo(() => {
    if (!isOpen) {
      return hasBeenOpened ? styles.opened : styles.disclosure;
    }
    return styles['currently-open'];
  }, [hasBeenOpened, isOpen]);

  return (
    <div>
      <ReakitDisclosure
        onClick={handleClick}
        as="div"
        className={className}
        {...disclosure}>
        <Chevron />
        {title}
      </ReakitDisclosure>
      {!isOpen && !!subtitle && (
        <span className={styles.subtitle}>{subtitle}</span>
      )}
      <DisclosureContent className={styles.content} {...disclosure}>
        {children}
      </DisclosureContent>
    </div>
  );
}
