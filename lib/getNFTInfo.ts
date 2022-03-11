import { ethers } from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import { ERC721 } from 'types/generated/abis';

export interface GetNFTInfoArgs {
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

export async function getNFTInfo({
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
  const isDataUri = tokenURI.startsWith('data:');
  try {
    const tokenURIRes = await fetch(
      isDataUri ? tokenURI : `/api/nftInfo/${encodeURIComponent(tokenURI)}`,
    );
    const NFTInfo: NFTResponseData = await tokenURIRes.json();

    if (!NFTInfo) {
      return null;
    }

    if ((NFTInfo as any).message) {
      console.error({ NFTInfo });
      return null;
    }

    const info = NFTInfo as any;

    const mediaUrl =
      info.animation_url == null || forceImage
        ? info.image
        : info.animation_url;

    const mediaMimeType = await getMimeType(mediaUrl);

    return {
      id: tokenId,
      name: info?.name,
      description: info?.description,
      mediaUrl,
      mediaMimeType,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getMimeType(mediaUrl: string) {
  const res = await fetch(mediaUrl, { method: 'HEAD' });
  // If we get no mime type in headers, we don't know what the MIME type is
  return res.headers.get('Content-Type') || 'application/octet-stream';
}
