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

  if ('SubscribeURL' in parsedBody) {
    await confirmTopicSubscription(parsedBody['SubscribeURL']);
    res.status(200).send('subscription successful');
    return;
  }

  try {
    const { eventName, event, txHash } = JSON.parse(
      parsedBody['Message'],
    ) as EventsSNSMessage;

    let hasPreviousLender = false;
    if (eventName === 'LendEvent') {
      const { data } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();

      if (!!data?.buyoutEvent) {
        hasPreviousLender = true;
      }
    }

    await sendEmailsForTriggerAndEntity(eventName, event, hasPreviousLender);

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
