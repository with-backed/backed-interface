import { captureException } from '@sentry/nextjs';
import { ethers } from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';

const ipfsGatewayTools = new IPFSGatewayTools();

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

    if (isDataUri) {
      // TODO: make this type safe. Since this is a data URI, it hasn't been
      // transformed the way the API does the non-data ones.
      Object.assign(NFTInfo, await getMedia(NFTInfo as any));
    }

    const { mediaUrl, mediaMimeType } = supportedMedia(NFTInfo, forceImage);

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

export async function getMimeType(mediaUrl: string) {
  const defaultMimeType = 'application/octet-stream';
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

function supportedMedia(
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
    getMimeType(animation_url || ''),
    getMimeType(image || ''),
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
    if ((e as any).message !== 'url is not string') {
      // got an annoying false positive message here; uri would definitely be
      // type string but the error would be raised anyway. Skipping those.
      captureException(e);
    }
  }
  return uri;
}
