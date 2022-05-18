import axios from 'axios';

export async function getPngBufferFromBase64SVG(
  base: string,
  contractAddress: string,
): Promise<string> {
  const pngBufferRes = await axios.post(`${process.env.SVG_TO_PNG_URL!}`, {
    svg: base,
    contractAddress,
  });
  return pngBufferRes.data.pngBuffer;
}
