import { ethers } from 'ethers';
import {
  GetNFTInfoArgs,
  getNFTInfo,
  getNFTInfoFromTokenInfo,
  GetNFTInfoResponse,
} from 'lib/getNFTInfo';
import { useCallback, useEffect, useState } from 'react';

export type TokenURIAndID = {
  tokenID: ethers.BigNumber;
  tokenURI: string;
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

export function useTokenMetadata(spec: GetNFTInfoArgs): MaybeNFTMetadata;
export function useTokenMetadata(spec: TokenURIAndID): MaybeNFTMetadata;
export function useTokenMetadata(spec: any): MaybeNFTMetadata {
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
    if (spec.tokenURI) {
      fetchedMetadata = await getNFTInfoFromTokenInfo(
        spec.tokenID,
        spec.tokenURI,
        spec.forceImage,
      );
    } else {
      fetchedMetadata = await getNFTInfo(spec);
    }
    if (fetchedMetadata) {
      METADATA_CACHE[cacheKey] = fetchedMetadata;
    }
    setResult({ isLoading: false, metadata: fetchedMetadata });
  }, [spec]);

  useEffect(() => {
    getMetadata();
  }, [getMetadata]);

  return result;
}
