import { ethers } from 'ethers';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Input from 'components/Input';

const SECONDS_IN_DAY = 60 * 60 * 24;

export default function DurationInput({
  minDurationSeconds,
  setDurationSeconds,
}) {
  const [minDurationDays] = useState(
    parseFloat(minDurationSeconds.toString()) / SECONDS_IN_DAY,
  );
  const [error, setError] = useState('');

  const handleChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setError('');

    if (value === '') {
      setDurationSeconds(ethers.BigNumber.from(0));
      return;
    }

    const valueAsFloat = parseFloat(value);
    if (valueAsFloat < 0) {
      setError('Rate cannot be negative');
      return;
    }

    if (valueAsFloat < minDurationDays) {
      setDurationSeconds(ethers.BigNumber.from(0));
      setError(`Minimum duration ${minDurationDays} days`);
      return;
    }
    const valueInSeconds = ethers.BigNumber.from(
      Math.ceil(valueAsFloat * SECONDS_IN_DAY),
    );
    setDurationSeconds(valueInSeconds);
  }, [minDurationDays, setDurationSeconds]);

  return (
    <Input
      type="number"
      title="duration in days"
      placeholder={`Minimum duration: ${minDurationDays} days`}
      error={error}
      onChange={handleChange}
    />
  );
}
