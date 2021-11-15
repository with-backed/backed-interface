import { ethers } from 'ethers';
import React, { ChangeEvent, useCallback, useState } from 'react';
import { Input } from 'components/Input';

const SECONDS_IN_DAY = 60 * 60 * 24;

type DurationInputProps = {
  setDurationSeconds: (seconds: ethers.BigNumber) => void;
};
export default function DurationInput({
  setDurationSeconds,
}: DurationInputProps) {
  const [error, setError] = useState('');

  const handleChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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

      const valueInSeconds = ethers.BigNumber.from(
        Math.ceil(valueAsFloat * SECONDS_IN_DAY),
      );
      setDurationSeconds(valueInSeconds);
    },
    [setDurationSeconds],
  );

  return (
    <Input
      type="number"
      title="duration in days (minimum)"
      placeholder="duration"
      error={error}
      onChange={handleChange}
    />
  );
}
