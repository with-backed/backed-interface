import { resetDiscordMetrics } from 'lib/events/consumers/discord/repository';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    await resetDiscordMetrics();
    res.status(200).json({ success: true });
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
