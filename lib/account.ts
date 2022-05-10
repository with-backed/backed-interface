import { ethers } from 'ethers';
import { contractDirectory, jsonRpcERC20Contract } from 'lib/contracts';

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
    contractDirectory.loanFacilitator,
  );
}

export function waitForApproval(account: string, contractAddress: string) {
  const contract = jsonRpcERC20Contract(contractAddress);
  const filter = contract.filters.Approval(
    account,
    contractDirectory.loanFacilitator,
    null,
  );
  return new Promise((resolve) => {
    contract.once(filter, () => {
      resolve(true);
    });
  });
}

export function resolveEns(address: string, jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  return provider.resolveName(address);
}

export function addressToENS(address: string, jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  return provider.lookupAddress(address);
}
