import { siteUrl } from 'lib/chainEnv';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBufferRes = await fetch(`${siteUrl()}/api/svg/pngBuffer`, {
    method: 'POST',
    body: JSON.stringify({
      svg: base,
    }),
  });
  const pngBufferResJson = (await pngBufferRes.json()) as { pngBuffer: string };
  return pngBufferResJson.pngBuffer;
}
