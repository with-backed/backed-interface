import React, { ChangeEvent, FunctionComponent, InputHTMLAttributes, useMemo } from 'react';
import debounce from 'lodash/debounce';

// Carried over from earlier implementation; we can play with this value and
// see what provides the best feel.
const WAIT_DURATION_IN_MILLISECONDS = 500;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: React.ReactNode;
  message?: React.ReactNode;
}

export const Input: FunctionComponent<InputProps> = ({
  type,
  title,
  placeholder,
  error,
  message,
  onChange,
}) => {
  const debouncedHandleChange = useMemo(() => debounce((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  }, WAIT_DURATION_IN_MILLISECONDS), [onChange]);

  return (
    <div className="input-wrapper">
      <h4 className="blue">
        {title}
      </h4>
      <input
        type={type}
        placeholder={placeholder}
        onChange={debouncedHandleChange}
        onWheel={(e) => e.currentTarget.blur()}
      />
      {error === '' ? '' : <p className="error">{error}</p>}
      {message === '' ? '' : <p className="message">{message}</p>}
    </div>
  );
}
