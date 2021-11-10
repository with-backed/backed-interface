import React, { SelectHTMLAttributes } from 'react';
import inputStyles from 'components/Input/Input.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = ({ title, ...props }: SelectProps) => {
  return (
    <div className={inputStyles.wrapper}>
      <label className={inputStyles.label}>
        {title}
        <select className={inputStyles.input} {...props} />
      </label>
    </div>
  );
};
