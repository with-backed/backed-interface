import { captureException } from '@sentry/nextjs';
import { ethers } from 'ethers';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import { SupportedNetwork } from './config';

const DATA_URI_MIME_REGEXP = /data:([^;]*)/;
const ipfsGatewayTools = new IPFSGatewayTools();

export type NFTResponseData = {
  name: string;
  description: string;
  tokenId: number;
  image: Media;
  animation: Media;
  external_url: string;
} | null;

export interface GetNFTInfoResponse {
  name: string;
  description: string;
  mediaUrl: string;
  mediaMimeType: string;
  id: ethers.BigNumber;
}

type NFTInfoParams = {
  collateralTokenId: ethers.BigNumber;
  collateralContractAddress: string;
  network: SupportedNetwork;
  forceImage?: boolean;
};
export async function getNFTInfoFromTokenInfo({
  collateralTokenId,
  collateralContractAddress,
  network,
  forceImage,
}: NFTInfoParams): Promise<GetNFTInfoResponse | null> {
  try {
    const tokenURIRes = await fetch(
      `/api/network/${network}/nftInfo/${collateralContractAddress}/${collateralTokenId.toString()}`,
    );
    const NFTInfo: NFTResponseData = await tokenURIRes.json();

    if (!NFTInfo) {
      return null;
    }

    const { mediaUrl, mediaMimeType } = supportedMedia(NFTInfo, forceImage);

    return {
      ...NFTInfo,
      id: ethers.BigNumber.from(NFTInfo.tokenId),
      mediaUrl,
      mediaMimeType,
    };
  } catch (error) {
    captureException(error);
    return null;
  }
}

export async function getMimeType(mediaUrl?: string) {
  const defaultMimeType = 'application/octet-stream';

  if (!mediaUrl) {
    return defaultMimeType;
  }

  if (mediaUrl.startsWith('data')) {
    const matches = mediaUrl.match(DATA_URI_MIME_REGEXP);
    if (matches && matches[1]) {
      return matches[1];
    }
  }

  try {
    const res = await fetch(mediaUrl, { method: 'HEAD' });
    // If we get no mime type in headers, we don't know what the MIME type is
    return res.headers.get('Content-Type') || defaultMimeType;
  } catch (e) {
    // Likely what happened here is a failure to fetch due to CORS. Could
    // sidestep by proxying this through an API route.
    captureException(e);
    return defaultMimeType;
  }
}

export function supportedMedia(
  nft: NFTResponseData,
  forceImage?: boolean,
): { mediaUrl: string; mediaMimeType: string } {
  const { animation, image } = nft!;

  if (!animation && !image) {
    throw new Error(`No media associated with ${nft?.name}`);
  }

  if (forceImage || !animation || animation.mediaMimeType.includes('text')) {
    return image!;
  }

  return animation!;
}

export type Media = { mediaUrl: string; mediaMimeType: string } | null;

interface TokenInfo {
  image?: string;
  image_url?: string;
  animation_url?: string;
}

/**
 * Given the object returned from fetching a token URI, return the media links
 * and mime types associated with it (if any).
 */
export async function getMedia({
  animation_url,
  image,
  image_url,
}: TokenInfo): Promise<{ image: Media; animation: Media }> {
  const finalImage = convertIPFS(image || image_url);
  const finalAnimation = convertIPFS(animation_url);

  const [animationMimeType, imageMimeType] = await Promise.all([
    getMimeType(finalAnimation),
    getMimeType(finalImage),
  ]);

  return {
    image: finalImage
      ? { mediaUrl: finalImage, mediaMimeType: imageMimeType }
      : null,
    animation: finalAnimation
      ? { mediaUrl: finalAnimation, mediaMimeType: animationMimeType }
      : null,
  };
}

/**
 * If `uri` is an IPFS uri, convert to use our gateway. Otherwise return it untouched.
 */
export function convertIPFS(uri?: string): string | undefined {
  if (!uri) {
    return uri;
  }

  try {
    if (ipfsGatewayTools.containsCID(uri).containsCid) {
      return ipfsGatewayTools.convertToDesiredGateway(
        uri,
        'https://nftpawnshop.mypinata.cloud',
      );
    }
  } catch (e) {
    captureException(e);
  }
  return uri;
}
