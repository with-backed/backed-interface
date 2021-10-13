import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Input from '../Input';

const SECONDS_IN_DAY = 60 * 60 * 24;

export default function DurationInput({ setDurationSeconds }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleValue = (value) => {
    setError('');
    setValue(value);

    if (value == '') {
      setDurationSeconds(ethers.BigNumber.from(0));
      return;
    }

    const valueAsFloat = parseFloat(value);
    if (valueAsFloat < 0) {
      setError('Rate cannot be negative');
      return;
    }

    const valueInSeconds = ethers.BigNumber.from(
      Math.ceil(valueAsFloat * SECONDS_IN_DAY),
    );
    console.log(valueInSeconds);
    setDurationSeconds(valueInSeconds);
  };

  return (
    <Input
      type="number"
      title="duration in days (minimum)"
      value={value}
      placeholder="duration"
      error={error}
      message=""
      setValue={handleValue}
    />
  );
}
