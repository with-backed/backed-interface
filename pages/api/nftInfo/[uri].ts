import { NextApiRequest, NextApiResponse } from 'next';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import { fetchWithTimeout } from 'lib/fetchWithTimeout';

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
    const tokenURIRes = await fetchWithTimeout(resolvedUri);
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
    if ((e as any).name === 'AbortError') {
      console.log(e);
      return res.status(408).json(null);
    }
    return res.status(404).json(null);
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
