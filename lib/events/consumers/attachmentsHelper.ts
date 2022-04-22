import { siteUrl } from 'lib/chainEnv';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBufferRes = await fetch(
    `https://svg-to-png-buffer.vercel.app/api/svgToPngBuffer`,
    {
      method: 'POST',
      body: JSON.stringify({
        svg: base,
      }),
    },
  );
  console.log({ pngBufferRes });
  const pngBufferResJson = (await pngBufferRes.json()) as { pngBuffer: string };
  console.log({ pngBufferResJson });
  return pngBufferResJson.pngBuffer;
}
