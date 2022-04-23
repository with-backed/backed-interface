import axios from 'axios';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBufferRes = await axios.post(
    `https://svg-to-png-buffer.vercel.app/api/svgToPngBuffer`,
    {
      svg: base,
    },
  );
  return pngBufferRes.data.pngBuffer;
}
