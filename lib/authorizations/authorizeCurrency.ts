import { ethers } from 'ethers';
import { web3Erc20Contract } from 'lib/contracts';

type AllowParams = {
  callback: () => void;
  contractAddress: string;
  setTxHash: (value: string) => void;
  setWaitingForTx: (value: boolean) => void;
};
export async function authorizeCurrency({
  callback,
  contractAddress,
  setTxHash,
  setWaitingForTx,
}: AllowParams) {
  const contract = web3Erc20Contract(contractAddress);
  const t = await contract.approve(
    process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
    ethers.BigNumber.from(2).pow(256).sub(1),
  );
  setWaitingForTx(true);
  setTxHash(t.hash);
  t.wait()
    .then(() => {
      callback();
      setWaitingForTx(false);
    })
    .catch((err) => {
      setWaitingForTx(false);
      console.log(err);
    });
}
