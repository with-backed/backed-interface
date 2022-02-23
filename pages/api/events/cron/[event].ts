import { NextApiRequest, NextApiResponse } from 'next';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import { sendEmail } from 'lib/notifications/emails';
import { NotificationEventTrigger } from 'lib/notifications/shared';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  if (req.method != 'POST') {
    res.status(405).send('Only POST requests allowed');
    return;
  }

  try {
    const { event } = req.query as { event: NotificationEventTrigger };
    const { borrowTicketHolder, lendTicketHolder } = req.body;

    const borrowerNotificationRequests =
      await getNotificationRequestsForAddress(borrowTicketHolder);

    for (let i = 0; i < borrowerNotificationRequests.length; i++) {
      sendEmail(borrowerNotificationRequests[i].deliveryDestination, event);
    }

    const lenderNotificationRequests = await getNotificationRequestsForAddress(
      lendTicketHolder,
    );

    for (let i = 0; i < lenderNotificationRequests.length; i++) {
      sendEmail(lenderNotificationRequests[i].deliveryDestination, event);
    }

    res.status(200).json(`notifications successfully sent`);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
