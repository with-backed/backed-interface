import { Token } from '@uniswap/sdk-core';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { useEffect, useMemo, useState } from 'react';

type TokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
};

export function useUniswapToken(tokenAddress?: string) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const { chainId, jsonRpcProvider, network } = useConfig();
  const contract = useMemo(() => {
    if (tokenAddress) {
      return jsonRpcERC20Contract(
        tokenAddress,
        jsonRpcProvider,
        network as SupportedNetwork,
      );
    }

    return null;
  }, [jsonRpcProvider, network, tokenAddress]);

  const token = useMemo(() => {
    if (tokenAddress && tokenInfo) {
      return new Token(
        chainId,
        tokenAddress,
        tokenInfo.decimals,
        tokenInfo.name,
        tokenInfo.symbol,
      );
    }

    return null;
  }, [chainId, tokenAddress, tokenInfo]);

  useEffect(() => {
    async function getTokenInfo() {
      if (contract) {
        const [decimals, name, symbol] = await Promise.all([
          contract.decimals(),
          contract.name(),
          contract.symbol(),
        ]);

        setTokenInfo({ decimals, name, symbol });
      }
    }

    getTokenInfo();
  }, [contract]);

  return token;
}
