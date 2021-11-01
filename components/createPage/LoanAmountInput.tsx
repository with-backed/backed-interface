import { ethers } from 'ethers';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Input from 'components/Input';

export default function LoanAmountInput({ setLoanAmount }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setValue(value);

    if (value === '') {
      setLoanAmount(ethers.BigNumber.from(0));
      return;
    }

    const valueAsFloat = parseFloat(value);

    if (valueAsFloat < 0) {
      setError('Rate cannot be negative');
      return;
    }
    setLoanAmount(valueAsFloat);
  }, []);

  return (
    <Input
      type="number"
      title="loan amount (minimum)"
      value={value}
      placeholder="loan amount"
      error={error}
      onChange={handleChange}
    />
  );
}
