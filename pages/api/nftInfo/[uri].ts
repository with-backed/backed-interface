import { NextApiRequest, NextApiResponse } from 'next';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import { captureException, withSentry } from '@sentry/nextjs';

const ipfsGatewayTools = new IPFSGatewayTools();

export type NFTResponseData = {
  name: string;
  description: string;
  tokenId: number;
  image: string;
  animation_url: string;
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

    res.status(200).json({
      name,
      description,
      tokenId,
      image: convertIPFS(image) || convertIPFS(image_url),
      animation_url: convertIPFS(animation_url),
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
    return res.status(404).json(null);
  }
}

/**
 * If `uri` is an IPFS uri, convert to use our gateway. Otherwise return it untouched.
 */
function convertIPFS(uri: string) {
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
