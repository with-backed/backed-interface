import { ERC721 } from 'abis/types';
import { ethers } from 'ethers';
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Input } from 'components/Input';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { AccountContext } from 'context/account';

export default function CollateralTokenIDInput({
  collateralContractAddress,
  setCollateralTokenID,
  setIsValidCollateral,
  setIsApproved,
}) {
  const { account } = useContext(AccountContext);
  const [contract, setContract] = useState<ERC721 | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleNewValue = async () => {
      setError('');

      if (value === '') {
        return;
      }

      const bigNumValue = ethers.BigNumber.from(value);

      if (contract !== null) {
        const owner = await contract.ownerOf(bigNumValue).catch((_error) => {
          setError(
            'Error fetching token info. Check contract address and token ID.',
          );
          setIsValidCollateral(false);
        });

        if (owner !== account) {
          setError('Connected address does not own this NFT');
          setIsValidCollateral(false);
          return;
        }
        setIsValidCollateral(true);
        setCollateralTokenID(bigNumValue);

        const approved = await contract.getApproved(bigNumValue);

        setIsApproved(
          approved.includes(
            process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
          ),
        );
      }
    };
    handleNewValue();
  }, [
    contract,
    value,
    account,
    setCollateralTokenID,
    setIsApproved,
    setIsValidCollateral,
  ]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (newValue === value) {
        return;
      }
      setValue(newValue);
    },
    [value],
  );

  useEffect(() => {
    if (collateralContractAddress !== '') {
      const contract = jsonRpcERC721Contract(collateralContractAddress);
      setContract(contract);
    } else {
      setContract(null);
    }
  }, [collateralContractAddress]);

  return (
    <Input
      type="text"
      title="collateral NFT token ID"
      placeholder="token id"
      error={error}
      onChange={handleChange}
    />
  );
}
