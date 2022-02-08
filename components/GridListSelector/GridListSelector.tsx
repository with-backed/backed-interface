import { GridView } from 'components/Icons/GridView';
import { ListView } from 'components/Icons/ListView';
import React, { useCallback } from 'react';
import { Checkbox } from 'reakit/Checkbox';
import styles from './GridListSelector.module.css';

type GridListSelectorProps = {
  handleChange: (checked: boolean) => void;
};

export const GridListSelector = ({ handleChange }: GridListSelectorProps) => {
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
      <div className={styles.grid}>
        <GridView />
      </div>
      <div className={styles.list}>
        <ListView />
      </div>
    </Checkbox>
  );
};
