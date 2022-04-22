import nodeHtmlToImage from 'node-html-to-image';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBuffer = await nodeHtmlToImage({
    html: `<img src="${base}" width="100%" height="100%" />`,
    quality: 100,
    type: 'png',
    puppeteerArgs: {
      args: ['--no-sandbox'],
    },
    encoding: 'base64',
  });
  return pngBuffer as string;
}
