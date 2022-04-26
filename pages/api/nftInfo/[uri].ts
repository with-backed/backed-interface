import { NextApiRequest, NextApiResponse } from 'next';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import { captureException, withSentry } from '@sentry/nextjs';
import { getMimeType } from 'lib/getNFTInfo';

const ipfsGatewayTools = new IPFSGatewayTools();

type Media = { mediaUrl: string; mediaMimeType: string } | null;

export type NFTResponseData = {
  name: string;
  description: string;
  tokenId: number;
  image: Media;
  animation: Media;
  external_url: string;
} | null;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NFTResponseData>,
) {
  try {
    const { uri } = req.query;
    const decodedUri = decodeURIComponent(uri as string);
    const resolvedUri = convertIPFS(decodedUri);

    if (!resolvedUri) {
      throw new Error(`Could not resolve ${decodedUri}`);
    }

    const tokenURIRes = await fetch(resolvedUri);
    const {
      name,
      description,
      tokenId,
      image,
      image_url,
      animation_url,
      external_url,
    } = await tokenURIRes.json();

    const finalImage = convertIPFS(image || image_url);
    const finalAnimation = convertIPFS(animation_url);

    const [animationMimeType, imageMimeType] = await Promise.all([
      getMimeType(animation_url || ''),
      getMimeType(image || ''),
    ]);

    res.status(200).json({
      name,
      description,
      tokenId,
      image: finalImage
        ? { mediaUrl: finalImage, mediaMimeType: imageMimeType }
        : null,
      animation: finalAnimation
        ? { mediaUrl: finalAnimation, mediaMimeType: animationMimeType }
        : null,
      external_url,
    });
  } catch (e) {
    if (e instanceof Error) {
      if (
        e.name === 'FetchError' &&
        e.message.startsWith('invalid json response body')
      ) {
        // this happens when the root CID exists but the child file does not. No way to get the file, do nothing.
      } else {
        captureException(e);
      }
    }
    // TODO: we could respond with a failure reason and surface that in the UI.
    return res.status(404).json(null);
  }
}

/**
 * If `uri` is an IPFS uri, convert to use our gateway. Otherwise return it untouched.
 */
function convertIPFS(uri?: string): string | undefined {
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

export default withSentry(handler);
