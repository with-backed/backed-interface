import axios from 'axios';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBufferRes = await axios.post(`${process.env.SVG_TO_PNG_URL!}`, {
    svg: base,
  });
  return pngBufferRes.data.pngBuffer;
}
