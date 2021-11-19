import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { AccountContext } from 'context/account';
import { ethers } from 'ethers';
import { jsonRpcERC721Contract, web3Erc721Contract } from 'lib/contracts';
import { useCallback, useContext, useState } from 'react';

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
  const { account } = useContext(AccountContext);
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
      textSize="small"
    />
  );
}
