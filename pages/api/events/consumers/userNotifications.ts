import { NextApiRequest, NextApiResponse } from 'next';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
} from 'types/generated/graphql/nftLoans';
import { nftBackedLoansClient } from 'lib/urql';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import {
  confirmTopicSubscription,
  EventsSNSMessage,
} from 'lib/events/sns/helpers';

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
    const { eventName, event, txHash } = JSON.parse(
      parsedBody['Message'],
    ) as EventsSNSMessage;

    console.log({ eventName, event });

    const now = Math.floor(new Date().getTime() / 1000);
    await sendEmailsForTriggerAndEntity(eventName, event, now);

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
