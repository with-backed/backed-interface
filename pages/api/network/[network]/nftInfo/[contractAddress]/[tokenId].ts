import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { convertIPFS, getMedia, NFTResponseData } from 'lib/getNFTInfo';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';
import { ethers } from 'ethers';
import { jsonRpcERC721Contract } from 'lib/contracts';

const DATA_URI_PREFIX = 'data:application/json;base64,';

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
    console.log({ uri, resolvedUri });
    if (!resolvedUri) {
      throw new Error(`Could not resolve ${uri}`);
    }

    const { name, description, image, image_url, animation_url, external_url } =
      await getJson(resolvedUri);

    const media = await getMedia({ animation_url, image, image_url });

    return res.status(200).json({
      name,
      description,
      tokenId: parseInt(tokenId),
      ...media,
      external_url,
    });
  } catch (e) {
    console.log({ e });
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

async function getJson(uri: string) {
  if (uri.startsWith(DATA_URI_PREFIX)) {
    // TODO: not always base64? not always json?
    const buffer = Buffer.from(uri.split(',')[1], 'base64');
    return JSON.parse(buffer.toString());
  } else {
    const res = await fetch(uri);
    return await res.json();
  }
}
