import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent, useCallback } from 'react';

type SearchTextInputProps = {
  label: string;
  placeholder: string;
  setTextValue: (token: string) => void;
  error?: string;
};

export default function SearchTextInput({
  label,
  placeholder,
  setTextValue,
  error,
}: SearchTextInputProps) {
  const handleTextInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.trim();

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
