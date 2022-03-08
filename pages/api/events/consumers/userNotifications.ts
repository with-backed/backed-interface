import { NextApiRequest, NextApiResponse } from 'next';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  Loan,
} from 'types/generated/graphql/nftLoans';
import { RawEventNameType, RawSubgraphEvent } from 'types/RawEvent';
import { nftBackedLoansClient } from 'lib/urql';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import { EventsSNSMessage } from 'lib/events/sns/helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { eventName, event, txHash } = req.body as EventsSNSMessage;

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
