import { ChangeEvent, InputHTMLAttributes, useCallback, useMemo } from "react";

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

  const id = useMemo(() => {
    return title.replace(/\s/g, '-');
  }, [title]);

  const hasError = Boolean(error);
  const hasMessage = Boolean(message);

  return (
    <>
      <label htmlFor={id} className={hasError ? styles.errorLabel : styles.label}>
        {title}
      </label>
      <div className={hasError ? styles.errorWrapper : styles.wrapper}>
        <input
          aria-invalid={hasError}
          id={id}
          className={styles.input}
          onChange={handleChange}
          {...props}
        />
      </div>
      {hasError && <p className={styles.errorMessage}>{error}</p>}
      {hasMessage && <p>{message}</p>}
    </>
  );
}
