import { authenticateRequest, AUTH_STATUS } from 'lib/authentication';
import { main } from 'lib/notifications/cron/dailyCron';
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
    const authStatus = authenticateRequest(req);
    if (authStatus == AUTH_STATUS.ok) {
      await main(new Date().getTime() / 1000);
      res.status(200).json({ success: true });
    } else {
      res.status(authStatus).json({ success: false });
    }
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(500);
  }
}
