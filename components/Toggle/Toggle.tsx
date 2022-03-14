import React, { useCallback } from 'react';
import { Checkbox } from 'reakit/Checkbox';
import styles from './Toggle.module.css';

type ToggleProps = {
  handleChange: (checked: boolean) => void;
  left: React.ReactNode;
  right: React.ReactNode;
};

export const Toggle = ({ handleChange, left, right }: ToggleProps) => {
  const [checked, setChecked] = React.useState(true);
  const toggle = useCallback(() => {
    setChecked(!checked);
    handleChange(!checked);
  }, [checked, handleChange, setChecked]);
  return (
    <Checkbox
      as="div"
      checked={checked}
      onChange={toggle}
      className={styles.selector}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </Checkbox>
  );
};
