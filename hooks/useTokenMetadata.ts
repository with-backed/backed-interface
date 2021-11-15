import { getNFTInfoByTokenURI, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { useCallback, useEffect, useState } from 'react';

/**
 * At some point we may want something more sophisticated. Mapping of tokenURI
 * to returned data, will persist within this session.
 **/
const METADATA_CACHE: { [key: string]: GetNFTInfoResponse } = {};

export function useTokenMetadata(tokenURI: string): GetNFTInfoResponse | null {
  const [metadata, setMetadata] = useState<GetNFTInfoResponse | null>(null);
  const getMetadata = useCallback(async () => {
    if (METADATA_CACHE[tokenURI]) {
      setMetadata(METADATA_CACHE[tokenURI]);
      return;
    }
    const metadata = await getNFTInfoByTokenURI(tokenURI);
    setMetadata(metadata);
  }, [tokenURI]);

  useEffect(() => {
    getMetadata();
  }, [getMetadata]);

  return metadata;
}
