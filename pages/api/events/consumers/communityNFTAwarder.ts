import { NextApiRequest, NextApiResponse } from 'next';
import {
  confirmTopicSubscription,
  EventsSNSMessage,
} from 'lib/events/sns/helpers';
import { sendBotUpdateForTriggerAndEntity } from 'lib/events/consumers/discord/formatter';
import { captureException, withSentry } from '@sentry/nextjs';
import { configs } from 'lib/config';
import {
  getOldestLendEventForUser,
  getOldestRepaymentEventForUser,
} from 'lib/eventsHelpers';
import { RawSubgraphEvent } from 'types/RawEvent';

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
    const { eventName, event, network } = JSON.parse(
      parsedBody['Message'],
    ) as EventsSNSMessage;

    console.log({ eventName, network });

    let oldestEvent: RawSubgraphEvent | null = null;
    let involvedAddress: string;

    if (eventName === 'LendEvent') {
      oldestEvent = await getOldestLendEventForUser(
        configs[network],
        event.loan.lendTicketHolder,
      );
      involvedAddress = oldestEvent?.lender;
    } else if (eventName === 'RepaymentEvent') {
      oldestEvent = await getOldestRepaymentEventForUser(
        configs[network],
        event.loan.borrowTicketHolder,
      );
      involvedAddress = oldestEvent?.repayer;
    } else {
      res.status(200).json('Community NFT Activity awarder successfully ran');
      return;
    }

    console.log({ oldestEvent });

    if (!oldestEvent) {
      // TODO(adamgobes): capture exception here
      res.status(400);
      return;
    }

    const routeSuffix =
      eventName === 'LendEvent' ? 'lend_event' : 'repayment_event';
    if (event.id === oldestEvent.id) {
      console.log({
        uri: `${process.env
          .BACKED_COMMUNITY_NFT_API!}/achievements/create/activity/${routeSuffix}`,
      });
      const res = await fetch(
        `${process.env
          .BACKED_COMMUNITY_NFT_API!}/achievements/create/activity/${routeSuffix}`,
        {
          method: 'POST',
          headers: {
            Authorization: `${process.env.COMMUNITY_NFT_API_USER}:${process.env.COMMUNITY_NFT_API_PASS}`,
          },
          body: JSON.stringify({
            ethAddress: involvedAddress,
          }),
        },
      );
      console.log(res.status);
    }
    res.status(200).json(`Community NFT Activity awarder successfully ran`);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
