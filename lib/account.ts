import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { jsonRpcERC20Contract, web3Erc20Contract } from './contracts';

export async function getAccountLoanAssetBalance(
  account: string,
  loanAssetContractAddress: string,
  loanAssetDecimals: ethers.BigNumber,
) {
  const loanAssetContract = jsonRpcERC20Contract(loanAssetContractAddress);
  const balance = await loanAssetContract.balanceOf(account);
  const humanReadableBalance = parseFloat(
    ethers.utils.formatUnits(balance, loanAssetDecimals),
  );
  return humanReadableBalance;
}

export async function getAccountLoanAssetAllowance(
  account: string,
  loanAssetContractAddress: string,
) {
  const assetContract = jsonRpcERC20Contract(loanAssetContractAddress);
  return assetContract.allowance(
    account as string,
    process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
  );
}

export function waitForApproval(account: string, contractAddress: string) {
  const contract = jsonRpcERC20Contract(contractAddress);
  const filter = contract.filters.Approval(
    account,
    process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
    null,
  );
  return new Promise((resolve) => {
    contract.once(filter, () => {
      resolve(true);
    });
  });
}

export function resolveEns(address: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
  );

  return provider.resolveName(address);
}

export function addressToENS(address: string, provider: Web3Provider) {
  return provider.lookupAddress(address);
}
