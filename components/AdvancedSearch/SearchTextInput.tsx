import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent, useCallback, useState } from 'react';

type SearchTextInputProps = {
  label: string;
  placeholder: string;
  isAddress: boolean;
  setTextValue: (token: string) => void;
};

export default function SearchTextInput({
  label,
  placeholder,
  isAddress,
  setTextValue,
}: SearchTextInputProps) {
  const [error, setError] = useState('');

  const handleTextInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.trim();
      if (newValue.length % 2 !== 0 && isAddress) {
        setError('Invalid address inputted');
        return;
      }

      if (newValue.length < 3) {
        setTextValue('');
      } else {
        setTextValue(newValue);
      }
    },
    [setTextValue],
  );

  return (
    <div className={styles.inputWrapper}>
      <span>{label}</span>
      <div className={styles.inputGroup}>
        <label>
          <Input
            onChange={(event) => handleTextInputChanged(event)}
            placeholder={placeholder}
          />
        </label>
      </div>
      {error && <div className={styles.errors}>{error}</div>}
    </div>
  );
}
