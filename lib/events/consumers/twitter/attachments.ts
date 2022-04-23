import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import fetch from 'node-fetch';
import { getPngBufferFromBase64SVG } from '../attachmentsHelper';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function nftResponseDataToImageBuffer(
  nftResponseData: NFTResponseData,
): Promise<string | undefined> {
  if (nftResponseData!.image.startsWith(SVG_PREFIX)) {
    return await getPngBufferFromBase64SVG(nftResponseData!.image);
  } else {
    const imageUrlRes = await fetch(nftResponseData!.image);
    const arraybuffer = await imageUrlRes.arrayBuffer();
    const outputBuffer = Buffer.from(arraybuffer);
    return outputBuffer.toString('base64');
  }
}
