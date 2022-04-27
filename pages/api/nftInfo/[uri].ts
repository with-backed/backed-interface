import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { convertIPFS, getMedia, Media } from 'lib/getNFTInfo';

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

    const media = await getMedia({ animation_url, image, image_url });

    res.status(200).json({
      name,
      description,
      tokenId,
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
