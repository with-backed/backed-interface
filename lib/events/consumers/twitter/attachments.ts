import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import fetch from 'node-fetch';
import sharp from 'sharp';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function nftResponseDataToImageBuffer(
  nftResponseData: NFTResponseData,
): Promise<string | undefined> {
  let outputBuffer: Buffer;

  if (nftResponseData!.image.startsWith(SVG_PREFIX)) {
    outputBuffer = await sharp(
      Buffer.from(
        nftResponseData!.image.substring(SVG_PREFIX.length),
        'base64',
      ),
    )
      .png()
      .toBuffer();
  } else {
    const imageUrlRes = await fetch(nftResponseData!.image);
    const arraybuffer = await imageUrlRes.arrayBuffer();
    outputBuffer = Buffer.from(arraybuffer);
  }

  return outputBuffer.toString('base64');
}
