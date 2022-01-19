import { CompletedButton, TransactionButton } from 'components/Button';
import { ethers } from 'ethers';
import { web3Erc721Contract } from 'lib/contracts';
import { isNFTApprovedForCollateral, NFTEntity } from 'lib/eip721Subraph';
import React, { useCallback, useEffect, useState } from 'react';

interface AuthorizeNFTButtonProps {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
  disabled: boolean;
  nft: NFTEntity | null;
  onAlreadyApproved: () => void;
  onApproved: () => void;
  onError: (e: Error) => void;
  onSubmit: () => void;
}
export function AuthorizeNFTButton({
  collateralAddress,
  collateralTokenID,
  disabled,
  nft,
  onAlreadyApproved,
  onApproved,
  onError,
  onSubmit,
}: AuthorizeNFTButtonProps) {
  const [transactionHash, setTransactionHash] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isCollateralApproved, setIsCollateralApproved] = useState(false);

  useEffect(() => {
    if (!!nft && isNFTApprovedForCollateral(nft)) {
      setIsCollateralApproved(true);
      onAlreadyApproved();
    }
  }, [nft, onAlreadyApproved]);

  const approve = useCallback(async () => {
    const web3Contract = web3Erc721Contract(collateralAddress);
    const t = await web3Contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
      collateralTokenID,
    );
    setTransactionHash(t.hash);
    setIsPending(true);
    onSubmit();
    t.wait()
      .then(() => {
        onApproved();
        setIsPending(false);
      })
      .catch((err) => {
        setIsPending(false);
        onError(err);
      });
  }, [collateralAddress, collateralTokenID, onApproved, onError, onSubmit]);
  const text = 'Authorize NFT';

  if (isCollateralApproved) {
    return <CompletedButton buttonText={text} success />;
  }

  return (
    <TransactionButton
      disabled={disabled}
      text={text}
      onClick={approve}
      txHash={transactionHash}
      isPending={isPending}
    />
  );
}
