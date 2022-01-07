import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent } from 'react';
import { ethers } from 'ethers';

type LoanNumericInputProps = {
  handleNumericChanged: (
    event: ChangeEvent<HTMLInputElement>,
    setValue: (val: number) => void,
  ) => void;
  setMin: (val: number) => void;
  setMax: (val: number) => void;
  label: string;
};

export default function LoanNumericInput({
  handleNumericChanged,
  setMin,
  setMax,
  label,
}: LoanNumericInputProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>{label}</div>
      <div className={styles.inputs}>
        <Input
          style={{ width: '100px' }}
          onChange={(event) => handleNumericChanged(event, setMin)}
          placeholder="Min"
        />
        <span className={styles.to}>to</span>
        <Input
          style={{ width: '100px' }}
          onChange={(event) => handleNumericChanged(event, setMax)}
          placeholder="Max"
        />
      </div>
    </div>
  );
}
