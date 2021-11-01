import { ethers } from 'ethers';
import { ChangeEvent, useCallback, useState } from 'react';
import Input from 'components/Input';

export default function LoanAmountInput({
  accountBalance,
  minLoanAmount,
  decimals,
  loanAssetSymbol,
  setLoanAmount,
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [minAmount] = useState(
    ethers.utils.formatUnits(minLoanAmount, decimals),
  );

  const handleChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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

    if (valueAsFloat < parseFloat(minAmount)) {
      setLoanAmount(ethers.BigNumber.from(0));
      setError(`Must be greater than or equal to ${minAmount}`);
      return;
    }

    if (valueAsFloat > parseFloat(accountBalance)) {
      setLoanAmount(ethers.BigNumber.from(0));
      setError(`Amount exceeds your ${loanAssetSymbol} balance`);
      return;
    }

    const atomicUnits = ethers.utils.parseUnits(value, decimals);
    setLoanAmount(atomicUnits);
  }, []);

  return (
    <Input
      type="number"
      title="loan amount"
      value={value}
      placeholder={`Minimum: ${minAmount} ${loanAssetSymbol}`}
      error={error}
      onChange={handleChange}
    />
  );
}
