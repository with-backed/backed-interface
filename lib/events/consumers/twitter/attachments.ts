import { NFTResponseData } from 'lib/getNFTInfo';
import fetch from 'node-fetch';
import { getPngBufferFromBase64SVG } from '../attachmentsHelper';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function nftResponseDataToImageBuffer(
  nftResponseData: NFTResponseData,
  contractAddress: string,
): Promise<string | undefined> {
  if (nftResponseData?.image?.mediaUrl.startsWith(SVG_PREFIX)) {
    return await getPngBufferFromBase64SVG(
      nftResponseData!.image!.mediaUrl,
      contractAddress,
    );
  } else {
    const imageUrlRes = await fetch(nftResponseData!.image!.mediaUrl);
    const arraybuffer = await imageUrlRes.arrayBuffer();
    const outputBuffer = Buffer.from(arraybuffer);
    return outputBuffer.toString('base64');
  }
}
