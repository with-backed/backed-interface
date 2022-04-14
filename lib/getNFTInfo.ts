import { captureException } from '@sentry/nextjs';
import { ethers } from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import { ERC721 } from 'types/generated/abis';

export interface GetNFTInfoResponse {
  name: string;
  description: string;
  mediaUrl: string;
  mediaMimeType: string;
  id: ethers.BigNumber;
}

export async function getNFTInfoFromTokenInfo(
  tokenId: ethers.BigNumber,
  tokenURI: string,
  forceImage: boolean = false,
): Promise<GetNFTInfoResponse | null> {
  const isDataUri = tokenURI.startsWith('data:');
  try {
    const tokenURIRes = await fetch(
      isDataUri ? tokenURI : `/api/nftInfo/${encodeURIComponent(tokenURI)}`,
    );
    const NFTInfo: NFTResponseData = await tokenURIRes.json();

    if (!NFTInfo) {
      return null;
    }

    const mediaUrl =
      !NFTInfo.animation_url || forceImage
        ? NFTInfo.image
        : NFTInfo.animation_url;

    const mediaMimeType = await getMimeType(mediaUrl);

    return {
      id: tokenId,
      name: NFTInfo?.name,
      description: NFTInfo?.description,
      mediaUrl,
      mediaMimeType,
    };
  } catch (error) {
    captureException(error);
    return null;
  }
}

async function getMimeType(mediaUrl: string) {
  const res = await fetch(mediaUrl, { method: 'HEAD' });
  // If we get no mime type in headers, we don't know what the MIME type is
  return res.headers.get('Content-Type') || 'application/octet-stream';
}
