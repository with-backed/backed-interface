import { ethers } from 'ethers';
import { contractDirectory, jsonRpcERC20Contract } from 'lib/contracts';
import { SupportedNetwork } from './config';

export async function getAccountLoanAssetBalance(
  account: string,
  loanAssetContractAddress: string,
  loanAssetDecimals: ethers.BigNumber,
  jsonRpcProvider: string,
) {
  const loanAssetContract = jsonRpcERC20Contract(
    loanAssetContractAddress,
    jsonRpcProvider,
  );
  const balance = await loanAssetContract.balanceOf(account);
  const humanReadableBalance = parseFloat(
    ethers.utils.formatUnits(balance, loanAssetDecimals),
  );
  return humanReadableBalance;
}

export async function getAccountLoanAssetAllowance(
  account: string,
  loanAssetContractAddress: string,
  jsonRpcProvider: string,
  network: SupportedNetwork,
) {
  const assetContract = jsonRpcERC20Contract(
    loanAssetContractAddress,
    jsonRpcProvider,
  );
  return assetContract.allowance(
    account as string,
    contractDirectory[network].loanFacilitator,
  );
}

export function waitForApproval(
  account: string,
  contractAddress: string,
  jsonRpcProvider: string,
  network: SupportedNetwork,
) {
  const contract = jsonRpcERC20Contract(contractAddress, jsonRpcProvider);
  const filter = contract.filters.Approval(
    account,
    contractDirectory[network].loanFacilitator,
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
