import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent, useCallback, useState } from 'react';

type LoanNumericInputProps = {
  setMin: (val: number) => void;
  setMax: (val: number) => void;
  label: string;
  loanAssetRequired: boolean;
  loanAsset?: string;
};

export default function LoanNumericInput({
  setMin,
  setMax,
  label,
  loanAssetRequired,
  loanAsset,
}: LoanNumericInputProps) {
  const [error, setError] = useState('');

  const handleNumericChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>, setValue: (val: number) => void) => {
      if (!loanAsset && loanAssetRequired) {
        setError('First, enter a symbol for the loan token');
        return;
      }

      const newValue = parseInt(event.target.value.trim());
      if (newValue < 0) {
        setError('Enter a positive number');
        return;
      }

      if (isNaN(newValue)) {
        setValue(0);
      } else {
        setValue(parseInt(event.target.value.trim()));
      }
      setError('');
    },
    [loanAsset, loanAssetRequired],
  );

  return (
    <div className={styles.inputWrapper}>
      <span>{label}</span>
      <div className={`${styles.numericInputGroup}`}>
        <label>
          <Input
            type="number"
            onChange={(event) => handleNumericChanged(event, setMin)}
            placeholder="Min"
          />
        </label>
        <span className={styles.to}>to</span>
        <label>
          <Input
            type="number"
            onChange={(event) => handleNumericChanged(event, setMax)}
            placeholder="Max"
          />
        </label>
      </div>
      {error && <div className={styles.errors}>{error}</div>}
    </div>
  );
}
