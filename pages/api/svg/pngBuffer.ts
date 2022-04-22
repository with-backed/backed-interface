import { captureException, withSentry } from '@sentry/nextjs';
import Chromium from 'chrome-aws-lambda';
import { NextApiRequest, NextApiResponse } from 'next';
import nodeHtmlToImage from 'node-html-to-image';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ pngBuffer: string } | string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { svg } = req.body;
    const pngBuffer = (await nodeHtmlToImage({
      html: `<html><body><img src="${svg}" width="100%" height="auto" /></body></html>`,
      quality: 100,
      type: 'png',
      puppeteerArgs: {
        args: [...Chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: Chromium.defaultViewport,
        executablePath: await Chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      },
      encoding: 'base64',
    })) as string;

    res.status(200).json({ pngBuffer });
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
