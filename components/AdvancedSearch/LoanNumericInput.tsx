import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent } from 'react';

type LoanNumericInputProps = {
  setMin: (val: number) => void;
  setMax: (val: number) => void;
  label: string;
};

const handleNumericChanged = (
  event: ChangeEvent<HTMLInputElement>,
  setValue: (val: number) => void,
) => {
  const newValue = parseInt(event.target.value.trim());
  if (isNaN(newValue)) {
    setValue(0);
  } else {
    setValue(parseInt(event.target.value.trim()));
  }
};

export default function LoanNumericInput({
  setMin,
  setMax,
  label,
}: LoanNumericInputProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>{label}</div>
      <div className={styles.inputs}>
        <Input
          type="number"
          onChange={(event) => handleNumericChanged(event, setMin)}
          placeholder="Min"
        />
        <span className={styles.to}>to</span>
        <Input
          type="number"
          onChange={(event) => handleNumericChanged(event, setMax)}
          placeholder="Max"
        />
      </div>
    </div>
  );
}
