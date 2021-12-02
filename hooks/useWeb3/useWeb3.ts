import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

/**
 * Just a typed wrapper to simplify imports.
 */
export function useWeb3() {
  return useWeb3React<Web3Provider>();
}
