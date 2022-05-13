import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { convertIPFS, getMedia, NFTResponseData } from 'lib/getNFTInfo';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';
import { ethers } from 'ethers';
import { jsonRpcERC721Contract } from 'lib/contracts';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NFTResponseData>,
) {
  try {
    validateNetwork(req.query);
    const { contractAddress, network, tokenId } = req.query as {
      contractAddress: string;
      network: string;
      tokenId: string;
    };

    const { jsonRpcProvider } = configs[network as SupportedNetwork];
    const contract = jsonRpcERC721Contract(contractAddress, jsonRpcProvider);
    const uri = await contract.tokenURI(ethers.BigNumber.from(tokenId));
    const resolvedUri = convertIPFS(uri);

    if (!resolvedUri) {
      throw new Error(`Could not resolve ${uri}`);
    }
    const tokenURIRes = await fetch(resolvedUri);
    const { name, description, image, image_url, animation_url, external_url } =
      await tokenURIRes.json();

    const media = await getMedia({ animation_url, image, image_url });

    return res.status(200).json({
      name,
      description,
      tokenId: parseInt(tokenId),
      ...media,
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

export default withSentry(handler);
