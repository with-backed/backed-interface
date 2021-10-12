import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Input from '../Input';

export default function LoanAmountInput({ setLoanAmount }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleValue = (value) => {
    setError('');
    setValue(value);

    if (value == '') {
      setLoanAmount(ethers.BigNumber.from(0));
      return;
    }

    const valueAsFloat = parseFloat(value);

    if (valueAsFloat < 0) {
      setError('Rate cannot be negative');
      return;
    }
    setLoanAmount(valueAsFloat);
  };

  return (
    <Input type="number" title="loan amount (minimum)" value={value} placeholder="loan amount" error={error} message="" setValue={handleValue} />
  );
}
