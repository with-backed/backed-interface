import { ethers } from 'ethers';
import { cid } from 'is-ipfs';
import remove from 'lodash/remove';
import { ERC721 } from '../abis/types';

interface GetNFTInfoArgs {
  contract: ERC721;
  tokenId: ethers.BigNumber;
  forceImage?: boolean;
}

export interface GetNFTInfoResponse {
  name: string;
  description: string;
  mediaUrl: string;
  mediaMimeType: string;
  id: ethers.BigNumber;
}

export default async function getNFTInfo({
  contract,
  tokenId,
  forceImage = false,
}: GetNFTInfoArgs): Promise<GetNFTInfoResponse | null> {
  try {
    const tokenURI = await contract.tokenURI(tokenId);

    return getNFTInfoFromTokenInfo(tokenId, tokenURI, forceImage);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getNFTInfoFromTokenInfo(
  tokenId: ethers.BigNumber,
  tokenURI: string,
  forceImage: boolean = false,
): Promise<GetNFTInfoResponse | null> {
  try {
    const resolvedTokenURI = isIPFS(tokenURI)
      ? makeIPFSUrl(tokenURI)
      : tokenURI;

    const tokenURIRes = await fetch(resolvedTokenURI);
    const metadata = await tokenURIRes.json();

    const imageURL =
      metadata?.animation_url == null || forceImage
        ? metadata?.image
        : metadata?.animation_url;

    const mediaUrl = isIPFS(imageURL) ? makeIPFSUrl(imageURL) : imageURL;

    const mediaMimeType = await getMimeType(mediaUrl);

    return {
      id: tokenId,
      name: metadata?.name,
      description: metadata?.description,
      mediaUrl,
      mediaMimeType,
    };
  } catch (error) {
    console.log(error);
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
  const res = await fetch(mediaUrl, { method: 'HEAD' });
  // If we get no mime type in headers, we don't know what the MIME type is
  return res.headers.get('Content-Type') || 'application/octet-stream';
}
