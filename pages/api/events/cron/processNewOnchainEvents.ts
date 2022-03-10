import { main } from 'lib/events/sqs/consumer';
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
    await main();
    res.status(200).json({ success: true });
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
