import { main } from 'lib/notifications/cron/sqsConsumer';
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
    const { authorization } = req.headers;

    if (
      authorization ===
      `Bearer ${process.env.NOTIFICATIONS_CRON_API_SECRET_KEY}`
    ) {
      await main();
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
