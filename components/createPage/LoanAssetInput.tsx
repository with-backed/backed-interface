import { showThrottleMessage } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { loadavg } from 'os';
import React, { useEffect, useState } from 'react';
import { jsonRpcERC20Contract } from '../../lib/contracts';
import { LoanAsset, getLoanAssets } from '../../lib/loanAssets';
import Input from '../Input';

export default function LoanAssetInput({ setDecimals, setLoanAssetAddress }) {
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([])

  const handleValue = async (newValue) => {
    newValue = newValue.trim();
    if (newValue == value) {
      return;
    }
    setError('');
    setValue(newValue);

    try {
      const address = ethers.utils.getAddress(newValue);
      const contract = jsonRpcERC20Contract(address);
      let error = false;
      const symbol = await contract.symbol().catch((e) => (error = true));
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
  };

  const loadAssets = async () => {
    const assets  = await getLoanAssets()
    setLoanAssetOptions(assets)
    setLoanAsset(assets[0].address)
  }

  const handleChange = async (event) => {
    console.log(event.target.value)
    const address = ethers.utils.getAddress(event.target.value);
    setLoanAsset(address)
    
  }

  const setLoanAsset = async (address: string) => {
    const contract = jsonRpcERC20Contract(address);
    const decimals = await contract.decimals().catch((e) => console.log(e));
    setDecimals(decimals);
    setLoanAssetAddress(address);
  }

  useEffect(() => {
    loadAssets()
  }, [])

  return (
    // <Input
    //   type="text"
    //   title="loan asset contract address"
    //   value={value}
    //   placeholder="e.g. DAI contract address: 0x6b175474e89094c44da98b954eedeac495271d0f"
    //   error={error}
    //   message={message}
    //   setValue={handleValue}
    // />
    <div className="input-wrapper">
    <h4 className="blue">
        loan asset
    </h4>
    <select onChange={handleChange}>
      {
        loanAssetOptions.map((a, i) => {
         return  <option key={i} value={a.address}>{a.symbol}</option>
        })
      }
    </select>
    </div>
  );
}
