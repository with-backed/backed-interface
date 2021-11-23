import { NextApiRequest, NextApiResponse } from 'next';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';

const ipfsGatewayTools = new IPFSGatewayTools();

export type NFTResponseData = {
  name: string;
  description: string;
  tokenId: number;
  image: string;
  animation_url: string;
  external_url: string;
} | null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NFTResponseData>,
) {
  try {
    const { uri } = req.query;
    const decodedUri = decodeURIComponent(uri as string);
    const resolvedUri = convertIPFS(decodedUri);
    const tokenURIRes = await fetch(resolvedUri);
    const { name, description, tokenId, image, animation_url, external_url } =
      await tokenURIRes.json();
    res.status(200).json({
      name,
      description,
      tokenId,
      image: convertIPFS(image),
      animation_url: convertIPFS(animation_url),
      external_url,
    });
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}

/**
 * If `uri` is an IPFS uri, convert to use our gateway. Otherwise return it untouched.
 */
function convertIPFS(uri: string) {
  if (ipfsGatewayTools.containsCID(uri).containsCid) {
    return ipfsGatewayTools.convertToDesiredGateway(
      uri,
      'https://nftpawnshop.mypinata.cloud',
    );
  }
  return uri;
}
