import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { useTimestamp } from 'hooks/useTimestamp';
import { SupportedNetwork } from 'lib/config';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export function useBalance(assetContractAddress: string) {
  const { address } = useAccount();
  const { jsonRpcProvider, network } = useConfig();
  const timestamp = useTimestamp();

  const [balance, setBalance] = useState<number>(0);

  const getBalance = useCallback(
    async () => {
      if (!address) {
        return;
      }
      const assetContract = jsonRpcERC20Contract(
        assetContractAddress,
        jsonRpcProvider,
        network as SupportedNetwork,
      );
      const [balance, decimals] = await Promise.all([
        assetContract.balanceOf(address),
        assetContract.decimals(),
      ]);

      const humanReadableBalance = parseFloat(
        ethers.utils.formatUnits(balance, decimals),
      );
      setBalance(humanReadableBalance);
    },
    // timestamp included as a dep to force refresh whenever timestamp updates (should indicate new block)
    [address, assetContractAddress, jsonRpcProvider, network, timestamp],
  );

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return balance;
}
