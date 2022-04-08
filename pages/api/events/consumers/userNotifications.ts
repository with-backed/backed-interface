import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import {
  confirmTopicSubscription,
  EventsSNSMessage,
} from 'lib/events/sns/helpers';
import { captureException, withSentry } from '@sentry/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  const parsedBody = JSON.parse(req.body);

  const isConfirmingSubscribe = await confirmTopicSubscription(parsedBody, res);
  if (isConfirmingSubscribe) {
    return;
  }

  try {
    const { eventName, event, mostRecentTermsEvent } = JSON.parse(
      parsedBody['Message'],
    ) as EventsSNSMessage;

    const now = Math.floor(new Date().getTime() / 1000);
    await sendEmailsForTriggerAndEntity(
      eventName,
      event,
      now,
      mostRecentTermsEvent,
    );

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
