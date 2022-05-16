import { captureException } from '@sentry/nextjs';
import { CompletedButton, TransactionButton } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { SupportedNetwork } from 'lib/config';
import { contractDirectory, web3Erc721Contract } from 'lib/contracts';
import { isNFTApprovedForCollateral } from 'lib/eip721Subraph';
import React, { useCallback, useEffect, useState } from 'react';
import { NFTEntity } from 'types/NFT';
import { useSigner } from 'wagmi';

const ID = 'authorizeNFT';

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
  const { network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const [{ data: signer }] = useSigner();
  const [transactionHash, setTransactionHash] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isCollateralApproved, setIsCollateralApproved] = useState(false);

  useEffect(() => {
    if (!!nft) {
      if (isNFTApprovedForCollateral(nft, network as SupportedNetwork)) {
        setIsCollateralApproved(true);
        onAlreadyApproved();
      } else {
        setIsCollateralApproved(false);
      }
    }
  }, [network, nft, onAlreadyApproved]);

  const approve = useCallback(async () => {
    const web3Contract = web3Erc721Contract(collateralAddress, signer!);
    const t = await web3Contract.approve(
      contractDirectory[network as SupportedNetwork].loanFacilitator,
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
        captureException(err);
        addMessage({
          kind: 'error',
          message: (
            <div>
              Failed to authorize NFT ID {collateralTokenID.toString()} on $
              {collateralAddress}.{' '}
              <EtherscanTransactionLink transactionHash={t.hash}>
                View transaction
              </EtherscanTransactionLink>
            </div>
          ),
        });
        onError(err);
      });
  }, [
    addMessage,
    collateralAddress,
    collateralTokenID,
    network,
    onApproved,
    onError,
    onSubmit,
    signer,
  ]);
  const text = 'Authorize NFT';

  if (isCollateralApproved) {
    return <CompletedButton id={ID} buttonText={text} success />;
  }

  return (
    <TransactionButton
      id={ID}
      disabled={disabled}
      text={text}
      onClick={approve}
      txHash={transactionHash}
      isPending={isPending}
    />
  );
}
