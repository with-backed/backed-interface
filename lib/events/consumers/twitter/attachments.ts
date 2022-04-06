import axios from 'axios';
import { ethers } from 'ethers';
import fs from 'fs';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import path from 'path';
import fetch from 'node-fetch';
import sharp from 'sharp';

const SVG_PREFIX = 'data:image/svg+xml;base64,';
const JSON_PREFIX = 'data:application/json;base64,';

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

  const res = await fetch(
    'https://nftpawnshop.mypinata.cloud/ipfs/QmPjabR1zWFuiMbh5bXRFUrmtbiuQiEMnDkfdahnFgfvXX',
  );

  return outputBuffer.toString('base64');
}
