import { useState } from 'react';
import { ethers } from 'ethers';
import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { jsonRpcERC20Contract, web3Erc20Contract } from 'lib/contracts';
import { useWeb3 } from 'hooks/useWeb3';

interface AllowButtonProps {
  contractAddress: string;
  symbol: string;
  callback: () => void;
}

export default function AllowButton({
  contractAddress,
  symbol,
  callback,
}: AllowButtonProps) {
  const { account } = useWeb3();
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const allow = async () => {
    const contract = web3Erc20Contract(contractAddress);
    const t = await contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
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
