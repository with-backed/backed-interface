import { captureException } from '@sentry/nextjs';
import { ethers, Signer } from 'ethers';
import { SupportedNetwork } from 'lib/config';
import { contractDirectory, web3Erc20Contract } from 'lib/contracts';

type AllowParams = {
  callback: () => void;
  contractAddress: string;
  network: SupportedNetwork;
  signer: Signer;
  setTxHash: (value: string) => void;
  setWaitingForTx: (value: boolean) => void;
};
export async function authorizeCurrency({
  callback,
  contractAddress,
  network,
  signer,
  setTxHash,
  setWaitingForTx,
}: AllowParams) {
  const contract = web3Erc20Contract(contractAddress, signer);
  const t = await contract.approve(
    contractDirectory[network].loanFacilitator,
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
      captureException(err);
    });
}
