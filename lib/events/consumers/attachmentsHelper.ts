import chromium from 'chrome-aws-lambda';
import nodeHtmlToImage from 'node-html-to-image';

export async function getPngBufferFromBase64SVG(base: string): Promise<string> {
  const pngBuffer = await nodeHtmlToImage({
    html: `<html><body><img src="${base}" width="100%" height="auto" /></body></html>`,
    quality: 100,
    type: 'png',
    puppeteerArgs: {
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    },
    encoding: 'base64',
  });
  return pngBuffer as string;
}
