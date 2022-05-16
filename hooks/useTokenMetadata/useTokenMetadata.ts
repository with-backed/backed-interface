import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { getNFTInfoFromTokenInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { useCallback, useEffect, useState } from 'react';

export type CollateralSpec = {
  collateralTokenId: ethers.BigNumber;
  collateralContractAddress: string;
  forceImage?: boolean;
};

/**
 * At some point we may want something more sophisticated. Mapping of tokenURI
 * to returned data, will persist within this session.
 **/
const METADATA_CACHE: { [key: string]: GetNFTInfoResponse } = {};

type LoadingNFTMetadata = {
  metadata: null;
  isLoading: true;
};

type ResolvedNFTMetadata = {
  metadata: GetNFTInfoResponse | null;
  isLoading: false;
};

export type MaybeNFTMetadata = LoadingNFTMetadata | ResolvedNFTMetadata;

export function useTokenMetadata(spec: CollateralSpec): MaybeNFTMetadata {
  const { network } = useConfig();
  const [result, setResult] = useState<MaybeNFTMetadata>({
    isLoading: true,
    metadata: null,
  });

  const getMetadata = useCallback(async () => {
    const cacheKey = JSON.stringify(spec);
    if (METADATA_CACHE[cacheKey]) {
      setResult({ isLoading: false, metadata: METADATA_CACHE[cacheKey] });
      return;
    }

    let fetchedMetadata: GetNFTInfoResponse | null = null;

    fetchedMetadata = await getNFTInfoFromTokenInfo({
      ...spec,
      network: network as SupportedNetwork,
    });

    if (fetchedMetadata) {
      METADATA_CACHE[cacheKey] = fetchedMetadata;
    }
    setResult({ isLoading: false, metadata: fetchedMetadata });
  }, [network, spec]);

  useEffect(() => {
    getMetadata();
  }, [getMetadata]);

  return result;
}
