import React, { useMemo } from 'react';
import ReactSelect, { components, GroupBase, Props } from 'react-select';

type SelectColor = 'dark' | 'light' | 'clickable';

interface SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends Props<Option, IsMulti, Group> {
  color?: SelectColor;
}

const Input: typeof components.Input = (props) => {
  return <components.Input {...props} data-lpignore />;
};

const backgrounds: { [key in SelectColor]: string } = {
  light: 'linear-gradient(180deg, var(--neutral-10) 5%, var(--neutral-5) 100%)',
  dark: 'var(--highlight-active-10)',
  clickable:
    'linear-gradient( 180deg, var(--highlight-clickable-5) 50%, var(--highlight-clickable-7) 100%)',
};

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  color = 'dark',
  isClearable = false,
  ...props
}: SelectProps<Option, IsMulti, Group>) {
  const defaultValue = useMemo(() => {
    if (props && props.options && props.options.length > 0) {
      return props.options[0] as Option;
    }
    return undefined;
  }, [props]);
  const controlBackground = backgrounds[color];
  return (
    <ReactSelect
      openMenuOnFocus
      styles={{
        container: (provided, state) => ({
          ...provided,
          filter: state.isFocused
            ? 'drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.1))'
            : 'none',
          zIndex: 2,
        }),
        option: (provided, state) => ({
          ...provided,
          background: state.isSelected
            ? controlBackground
            : state.isFocused
            ? 'var(--highlight-clickable-5)'
            : 'var(--background-white)',
          color:
            state.isFocused && !state.isSelected
              ? 'var(--highlight-clickable-100)'
              : 'black',
          cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        }),
        control: (provided, state) => ({
          ...provided,
          background: state.isFocused
            ? 'var(--highlight-active-10)'
            : controlBackground,
          border: 'none',
          outline: 'none',
          borderRadius: 'var(--border-radius-large)',
          padding: '0px 4px 0px 14px',
          zIndex: 2,
          cursor: state.isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: 'none',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: (provided) => ({
          ...provided,
          color:
            color === 'clickable'
              ? 'var(--highlight-clickable-100)'
              : 'var(--neutral-100)',
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
        singleValue: (provided) => ({
          ...provided,
          color:
            color === 'clickable'
              ? 'var(--highlight-clickable-100)'
              : provided.color,
        }),
      }}
      defaultValue={defaultValue}
      isClearable={isClearable}
      components={{ Input }}
      {...props}
    />
  );
}
