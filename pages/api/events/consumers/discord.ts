import { NextApiRequest, NextApiResponse } from 'next';
import {
  confirmTopicSubscription,
  EventsSNSMessage,
} from 'lib/events/sns/helpers';
import { sendBotUpdateForTriggerAndEntity } from 'lib/events/consumers/discord/formatter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
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

    console.log({ eventName, eventCollateral: event.loan.collateralName });

    const now = Math.floor(new Date().getTime() / 1000);
    await sendBotUpdateForTriggerAndEntity(
      eventName,
      event,
      now,
      mostRecentTermsEvent,
    );

    res.status(200).json(`discord bot messages successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
