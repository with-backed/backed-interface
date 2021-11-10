import { useState } from 'react';
import { ethers } from 'ethers';
import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { jsonRpcERC20Contract, web3Erc20Contract } from 'lib/contracts';

interface AllowButtonProps {
  contractAddress: string;
  account: string;
  symbol: string;
  callback: () => void;
}

export default function AllowButton({
  contractAddress,
  account,
  symbol,
  callback,
}: AllowButtonProps) {
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const allow = async () => {
    const contract = web3Erc20Contract(contractAddress);
    const t = await contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      ethers.BigNumber.from(2).pow(256).sub(1),
    );
    setWaitingForTx(true);
    setTxHash(t.hash);
    t.wait()
      .then((receipt) => {
        setWaitingForTx(true);
        waitForApproval();
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.log(err);
      });
  };

  const waitForApproval = async () => {
    const contract = jsonRpcERC20Contract(contractAddress);
    const filter = contract.filters.Approval(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      null,
    );
    contract.once(filter, (owner, spender, amount) => {
      callback();
      setWaitingForTx(false);
    });
  };

  return (
    <div id="allowance-button-wrapper">
      <TransactionButton
        text={`allow pawn shop to move your ${symbol}`}
        onClick={allow}
        txHash={txHash}
        isPending={waitingForTx}
      />
    </div>
  );
}
