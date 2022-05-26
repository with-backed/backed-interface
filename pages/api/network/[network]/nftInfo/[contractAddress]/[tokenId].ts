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

    const metadata = await getMetadata(
      network as SupportedNetwork,
      contractAddress,
      ethers.BigNumber.from(tokenId),
    );

    return res.status(200).json(metadata);
  } catch (e) {
    captureException(e);
    // TODO: we could respond with a failure reason and surface that in the UI.
    return res.status(404).json(null);
  }
}

export default withSentry(handler);

/**
 * Only for use on backend. When fetching NFT metadata from client, prefer
 * hitting the api endpoint or using a function that calls it (such as
 * `getNFTInfoFromTokenInfo`)
 */
export async function getMetadata(
  network: SupportedNetwork,
  contractAddress: string,
  tokenId: ethers.BigNumber,
): Promise<NFTResponseData> {
  try {
    const { jsonRpcProvider } = configs[network];
    const contract = jsonRpcERC721Contract(contractAddress, jsonRpcProvider);
    const uri = await contract.tokenURI(ethers.BigNumber.from(tokenId));
    const resolvedUri = convertIPFS(uri);
    if (!resolvedUri) {
      throw new Error(`Could not resolve ${uri}`);
    }

    const json = await getJson(resolvedUri);

    if (!json) {
      throw new Error(`Could not fetch json from ${uri}`);
    }

    const { name, description, image, image_url, animation_url, external_url } =
      json;

    const media = await getMedia({ animation_url, image, image_url });

    return {
      name,
      description,
      tokenId: tokenId.toNumber(),
      ...media,
      external_url,
    };
  } catch (e) {
    captureException(e);
    return null;
  }
}

async function getJson(uri: string) {
  try {
    if (uri.startsWith(DATA_URI_PREFIX)) {
      // TODO: not always base64? not always json?
      const buffer = Buffer.from(uri.split(',')[1], 'base64');
      return JSON.parse(buffer.toString());
    } else {
      const res = await fetch(uri);
      return await res.json();
    }
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

    return null;
  }
}
