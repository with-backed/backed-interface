import { ethers } from 'ethers';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Input from 'components/Input';
import { jsonRpcERC20Contract } from '../../lib/contracts';

export default function LoanAssetInput({ setDecimals, setLoanAssetAddress }) {
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.trim();
    if (newValue === value) {
      return;
    }
    setError('');
    setValue(newValue);

    try {
      const address = ethers.utils.getAddress(newValue);
      const contract = jsonRpcERC20Contract(address);
      let error = false;
      // eslint-disable-next-line no-return-assign,@typescript-eslint/no-unused-vars
      const symbol = await contract.symbol().catch((e) => (error = true));
      // eslint-disable-next-line no-return-assign,@typescript-eslint/no-unused-vars
      const decimals = await contract.decimals().catch((e) => (error = true));
      if (error) {
        setError(
          'Error fetching loan asset info, please ensure you have entered an ERC20 contract address',
        );
        return;
      }
      setMessage(String(symbol));
      setDecimals(decimals);
      setLoanAssetAddress(address);
    } catch (error) {
      setError('invalid address');
    }
  }, []);

  return (
    <Input
      type="text"
      title="loan asset contract address"
      value={value}
      placeholder="e.g. DAI contract address: 0x6b175474e89094c44da98b954eedeac495271d0f"
      error={error}
      message={message}
      onChange={handleChange}
    />
  );
}
