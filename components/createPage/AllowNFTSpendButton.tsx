import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import { jsonRpcERC721Contract, web3Erc721Contract } from 'lib/contracts';
import React, { useCallback, useState } from 'react';

type AllowNFTSpendButtonProps = {
  collateralAddress: string;
  tokenId: ethers.BigNumber;
  setIsApproved: (value: boolean) => void;
};
export function AllowNFTSpendButton({
  collateralAddress,
  tokenId,
  setIsApproved,
}: AllowNFTSpendButtonProps) {
  const { account } = useWeb3();
  const [transactionHash, setTransactionHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const waitForApproval = useCallback(async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);
    const filter = contract.filters.Approval(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      tokenId,
    );
    contract.once(filter, () => {
      setWaitingForTx(false);
      setIsApproved(true);
    });
  }, [account, collateralAddress, setIsApproved, tokenId]);

  const approve = useCallback(async () => {
    const web3Contract = web3Erc721Contract(collateralAddress);
    const t = await web3Contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
      tokenId,
    );
    setTransactionHash(t.hash);
    setWaitingForTx(true);
    t.wait()
      .then(() => {
        waitForApproval();
        setWaitingForTx(true);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.error(err);
      });
  }, [collateralAddress, tokenId, waitForApproval]);

  return (
    <TransactionButton
      text="authorize NFT transfer"
      onClick={approve}
      txHash={transactionHash}
      isPending={waitingForTx}
    />
  );
}
