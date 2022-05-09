import { NextApiRequest, NextApiResponse } from 'next';
import {
  confirmTopicSubscription,
  EventsSNSMessage,
} from 'lib/events/sns/helpers';
import { sendTweetForTriggerAndEntity } from 'lib/events/consumers/twitter/formatter';
import { captureException, withSentry } from '@sentry/nextjs';
import { configFromNetworkName } from 'lib/config';

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
    const { eventName, event, mostRecentTermsEvent, network } = JSON.parse(
      parsedBody['Message'],
    ) as EventsSNSMessage;

    await sendTweetForTriggerAndEntity(
      eventName,
      event,
      configFromNetworkName(network),
      mostRecentTermsEvent,
    );

    res.status(200).json(`tweet successfully sent`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
