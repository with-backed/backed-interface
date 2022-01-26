import React, { useMemo } from 'react';
import ReactSelect, { GroupBase, Props } from 'react-select';

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ isClearable = false, ...props }: Props<Option, IsMulti, Group>) {
  const defaultValue = useMemo(() => {
    if (props && props.options && props.options.length > 0) {
      return props.options[0] as Option;
    }
    return undefined;
  }, [props]);
  return (
    <ReactSelect
      openMenuOnFocus
      styles={{
        container: (provided, state) => ({
          ...provided,
          filter: state.isFocused
            ? 'drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.1))'
            : 'none',
        }),
        control: (provided, state) => ({
          ...provided,
          background: state.isFocused
            ? 'var(--highlight-active-10)'
            : 'var(--background-radial-gradient)',
          border: 'none',
          outline: 'none',
          borderRadius: 'var(--border-radius-large)',
          padding: 'var(--padding-button)',
          zIndex: 2,
          cursor: state.isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: 'none',
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
          border: 'none',
          boxShadow: 'none',
        }),
        valueContainer: (provided) => ({
          ...provided,
          padding: 'none',
        }),
      }}
      defaultValue={defaultValue}
      isClearable={isClearable}
      {...props}
    />
  );
}
