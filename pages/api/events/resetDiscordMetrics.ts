import { captureException, withSentry } from '@sentry/nextjs';
import { resetDiscordMetrics } from 'lib/events/consumers/discord/repository';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    await resetDiscordMetrics();
    res.status(200).json({ success: true });
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
