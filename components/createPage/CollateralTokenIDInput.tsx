import { ethers } from 'ethers';
import React, {
  ChangeEvent, useCallback, useEffect, useState,
} from 'react';
import { jsonRpcERC721Contract } from '../../lib/contracts';
import Input from '../Input';

export default function CollateralTokenIDInput({
  account,
  collateralContractAddress,
  setCollateralTokenID,
  setIsValidCollateral,
  setIsApproved,
}) {
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (newValue === value) {
      return;
    }
    handleNewValue(newValue, contract);
  }, []);

  // TODO: @wilsoncusack, this can probably be refactored to be reactive to
  // changes in value instead of manually called.
  const handleNewValue = async (newValue, contract) => {
    setError('');
    setValue(newValue);

    if (newValue == '') {
      return;
    }

    const bigNumValue = ethers.BigNumber.from(newValue);

    if (contract != null) {
      let error = false;
      const owner = await contract
        .ownerOf(bigNumValue)
        .catch((e) => (error = true));
      if (error) {
        setError(
          'Error fetching token info. Check contract address and token ID.',
        );
        setIsValidCollateral(false);
        return;
      }

      if (owner != account) {
        setError('Connected address does not own this NFT');
        setIsValidCollateral(false);
        return;
      }
      setIsValidCollateral(true);
      setCollateralTokenID(bigNumValue);

      const approved = await contract.getApproved(bigNumValue);

      setIsApproved(
        approved.includes(process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT),
      );
    }
  };

  useEffect(() => {
    if (collateralContractAddress != '') {
      const contract = jsonRpcERC721Contract(collateralContractAddress);
      setContract(contract);
      handleNewValue(value, contract);
    } else {
      setContract(null);
      handleNewValue(value, null);
    }
    console.log('handle');
  }, [collateralContractAddress]);

  return (
    <Input
      type="text"
      title="collateral NFT token ID"
      value={value}
      placeholder="token id"
      error={error}
      onChange={handleChange}
    />
  );
}
