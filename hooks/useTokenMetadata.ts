import { useCallback, useEffect, useState } from 'react';

const IPFS_PREFIX = /^ipfs:\/\//;
/**
 * At some point we may want something more sophisticated. Mapping of tokenURI
 * to returned data, will persist within this session.
 **/
const METADATA_CACHE = {};

function makeIPFSUrl(
  url: string,
  ipfsHost = 'https://gateway.pinata.cloud/ipfs/',
) {
  return ipfsHost + url.replace(IPFS_PREFIX, '');
}

function resolveTokenURI(tokenURI: string) {
  if (IPFS_PREFIX.test(tokenURI)) {
    return makeIPFSUrl(tokenURI);
  }
  return tokenURI;
}

export function useTokenMetadata(tokenURI: string) {
  const [metadata, setMetadata] = useState(null);
  const getMetadata = useCallback(async () => {
    if (METADATA_CACHE[tokenURI]) {
      setMetadata(METADATA_CACHE[tokenURI]);
      return;
    }
    const uri = resolveTokenURI(tokenURI);
    const metadataRes = await fetch(uri);
    const metadataJSON = await metadataRes.json();
    setMetadata(metadataJSON);
  }, [tokenURI]);

  useEffect(() => {
    getMetadata();
  }, [getMetadata]);

  return metadata;
}
