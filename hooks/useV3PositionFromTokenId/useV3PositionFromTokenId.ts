import { BigNumber } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { nonFungiblePositionManager } from 'lib/contracts';
import { useEffect, useMemo, useState } from 'react';

export interface PositionDetails {
  nonce: BigNumber;
  tokenId: BigNumber;
  operator: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  tokensOwed0: BigNumber;
  tokensOwed1: BigNumber;
}

interface UseV3PositionsResults {
  loading: boolean;
  positionDetails: PositionDetails | null;
}

export function useV3PositionFromTokenId(
  tokenId: BigNumber,
): UseV3PositionsResults {
  const { jsonRpcProvider, network } = useConfig();
  const [details, setDetails] = useState<PositionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const positionManager = useMemo(
    () =>
      nonFungiblePositionManager(jsonRpcProvider, network as SupportedNetwork),
    [jsonRpcProvider, network],
  );

  useEffect(() => {
    setLoading(true);
    positionManager.positions(tokenId).then((result) => {
      setDetails({
        tokenId,
        fee: result.fee,
        feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
        liquidity: result.liquidity,
        nonce: result.nonce,
        operator: result.operator,
        tickLower: result.tickLower,
        tickUpper: result.tickUpper,
        token0: result.token0,
        token1: result.token1,
        tokensOwed0: result.tokensOwed0,
        tokensOwed1: result.tokensOwed1,
      });
      setLoading(false);
    });
  }, [positionManager, tokenId]);

  return {
    positionDetails: details,
    loading,
  };
}
