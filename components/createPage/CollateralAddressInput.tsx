import { ethers } from 'ethers';
import React, { useState } from 'react';
import Input from '../Input';

export default function CollateralAddressInput({ setCollateralAddress }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleValue = (newValue) => {
    newValue = newValue.trim();
    if (newValue == value) {
      return;
    }
    setError('');
    setValue(newValue);

    if (newValue == '') {
      setCollateralAddress('');
      return;
    }
    try {
      const address = ethers.utils.getAddress(newValue);
      setCollateralAddress(address);
    } catch (error) {
      setError('invalid address');
    }
  };

  return (
    <Input
      type="text"
      title="collateral NFT contract address"
      value={value}
      placeholder="NFT contract address, e.g. 0x69c40e500b84660cb2ab09cB9614fa2387F95F64"
      error={error}
      message=""
      setValue={handleValue}
    />
  );
}
