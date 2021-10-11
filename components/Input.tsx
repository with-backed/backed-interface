import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  setValue: (value: string) => void;
  title: string;
  error?: React.ReactNode;
  message?: React.ReactNode;
};

export default function Input({ setValue, error, message, title, ...props }: InputProps) {
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, [setValue]);

  const hasError = Boolean(error);
  const hasMessage = Boolean(message);

  return (
    <div className={styles.wrapper}>
      <label className={hasError ? styles.errorLabel : styles.label}>
        {title}
        <input
          aria-invalid={hasError}
          className={hasError ? styles.errorInput : styles.input}
          onChange={handleChange}
          {...props}
        />
      </label>
      {hasError && <p className={styles.errorMessage}>{error}</p>}
      {hasMessage && <p>{message}</p>}
    </div>
  );
}
