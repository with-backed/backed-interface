import { NextApiRequest, NextApiResponse } from 'next';
import {
  BuyoutByTransactionHashDocument,
  BuyoutByTransactionHashQuery,
  Loan,
} from 'types/generated/graphql/nftLoans';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { EventAsStringType } from 'types/Event';
import { nftBackedLoansClient } from 'lib/urql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { event } = req.query as { event: EventAsStringType };
    const { involvedAddress, loan, txHash } = req.body as {
      involvedAddress: string;
      loan: Loan;
      txHash: string;
    };

    let hasPreviousLender = false;
    if (event === 'LendEvent') {
      const { data } = await nftBackedLoansClient
        .query<BuyoutByTransactionHashQuery>(BuyoutByTransactionHashDocument, {
          id: txHash,
        })
        .toPromise();

      if (!!data?.buyoutEvent) {
        hasPreviousLender = true;
      }
    }

    const notificationRequests = await getNotificationRequestsForAddress(
      involvedAddress,
    );

    for (let i = 0; i < notificationRequests.length; i++) {
      sendEmail(
        notificationRequests[i].deliveryDestination,
        event,
        loan,
        hasPreviousLender,
      );
    }

    res
      .status(200)
      .json(`notifications successfully sent to ${involvedAddress}`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
