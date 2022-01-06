import React, { useMemo } from 'react';
import ReactSelect, { NonceProvider, StylesConfig } from 'react-select';

const customStyles: StylesConfig = {
  control: (provided) => ({
    ...provided,
    background: 'var(--highlight-active-10)',
    border: 'none',
    outline: 'none',
    borderRadius: 'var(--border-radius-large)',
    padding: 'var(--padding-button)',
    zIndex: 2,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'var(--neutral-100)',
  }),
  menu: (provided) => ({
    ...provided,
    background: 'var(--background-white)',
    paddingTop: '2rem',
    paddingBottom: '0.5rem',
    marginTop: '-1.5rem',
    borderRadius: 'var(--border-radius-large)',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: 'none',
  }),
};

interface SelectProps extends React.ComponentProps<typeof ReactSelect> {}
export function Select({ ...props }: SelectProps) {
  const defaultValue = useMemo(() => {
    if (props && props.options && props.options.length > 0) {
      return props.options[0];
    }
    return undefined;
  }, [props]);
  return (
    <ReactSelect
      openMenuOnFocus
      styles={customStyles}
      defaultValue={defaultValue}
      {...props}
    />
  );
}
