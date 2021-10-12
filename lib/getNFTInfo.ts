import { ethers } from 'ethers';
import { cid } from 'is-ipfs';
import remove from 'lodash/remove';

interface GetNFTInfoArgs {
  Contract: ethers.Contract,
  tokenId: ethers.BigNumber
}

export interface GetNFTInfoResponse {
  name: string
  description: string
  mediaUrl: string
  mediaMimeType: string
  address: string
  id: ethers.BigNumber
}

export default async function getNFTInfo({
  Contract,
  tokenId,
}: GetNFTInfoArgs) : Promise<GetNFTInfoResponse> {
  try {
    const tokenURI = await Contract.tokenURI(tokenId);

    const resolvedTokenURI = isIPFS(tokenURI)
      ? makeIPFSUrl(tokenURI)
      : tokenURI;

    const tokenURIRes = await fetch(resolvedTokenURI);

    const metadata = await tokenURIRes.json();

    const mediaUrl = isIPFS(metadata?.image)
      ? makeIPFSUrl(metadata?.image)
      : metadata?.image;

    const mediaMimeType = await getMimeType(mediaUrl);

    return {
      name: metadata?.name,
      description: metadata?.description,
      mediaUrl,
      mediaMimeType,
      address: Contract.address,
      id: tokenId,
    };
  } catch {
    return null;
  }
}

function isIPFS(url: string) {
  try {
    if (cid(url)) return true;
    const { protocol } = new URL(url);
    return protocol === 'ipfs:';
  } catch (error) {
    return false;
  }
}

function makeIPFSUrl(
  url: string,
  ipfsHost = 'https://gateway.pinata.cloud/ipfs/',
) {
  if (cid(url)) return `${ipfsHost}${url}`;

  const urlArray = url.split('/');
  const cidIndex = urlArray.findIndex((curr) => cid(curr));
  const newCidPath = remove(urlArray, (_, i) => i >= cidIndex).join('/');

  return `${ipfsHost}${newCidPath}`;
}

async function getMimeType(mediaUrl: string) {
  const res = await fetch(mediaUrl, { method: 'HEAD', mode: 'no-cors' });
  return res.headers.get('Content-Type');
}
