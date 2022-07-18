import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { ethAddress, category, reason, value } = req.body;

    const message = `**New Form Nomination for ${ethAddress}**
Category: ${category}
Value: ${value} XP
Reason: ${reason}
`;

    await sendBotMessage(message, process.env.NOMINATION_CHANNEL_ID!);

    res.status(200).json(`discord nomination bot message successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
