import React, {
  ChangeEvent,
  FunctionComponent,
  InputHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import debounce from 'lodash/debounce';
import styles from './Input.module.css';

// Carried over from earlier implementation; we can play with this value and
// see what provides the best feel.
const WAIT_DURATION_IN_MILLISECONDS = 500;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: React.ReactNode;
  message?: React.ReactNode;
}

export const Input: FunctionComponent<InputProps> = ({
  onChange,
  error,
  message,
  title,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleWheel = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    // this stops the scroll event from changing the input (annoying)
    inputRef.current.blur();
    // this refocuses the input briefly after scrolling to prevent a different annoyance
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, []);

  const debouncedHandleChange = useMemo(
    () =>
      debounce((event: ChangeEvent<HTMLInputElement>) => {
        onChange(event);
      }, WAIT_DURATION_IN_MILLISECONDS),
    [onChange],
  );

  const hasError = Boolean(error);
  const hasMessage = Boolean(message);
  return (
    <div className={styles.wrapper}>
      <label className={hasError ? styles.errorLabel : styles.label}>
        {title}
        <input
          aria-invalid={hasError}
          className={hasError ? styles.errorInput : styles.input}
          onChange={debouncedHandleChange}
          ref={inputRef}
          onWheel={handleWheel}
          {...props}
        />
      </label>
      {hasError && <p className={styles.errorMessage}>{error}</p>}
      {hasMessage && message}
    </div>
  );
};
