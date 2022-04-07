import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/ses';
import {
  BuyoutEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
  CollateralSeizureEvent,
} from 'types/generated/graphql/nftLoans';
import { NotificationMethod, NotificationTriggerType } from './shared';
import { RawSubgraphEvent } from 'types/RawEvent';
import { getNotificationRequestsForAddress } from './repository';
import { generateHTMLForEmail } from './mjml';
import { getEmailComponentsMap, getEmailSubject } from './formatter';

export async function sendEmailsForTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
  mostRecentTermsEvent?: LendEvent,
) {
  // we do not want to send LendEvent emails and BuyoutEvent emails
  if (emailTrigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  // this is a map of ethAddress -> EmailComponent indicating what email components each address should receive
  const addressToEmailComponents = await getEmailComponentsMap(
    emailTrigger,
    entity,
    now,
    mostRecentTermsEvent,
  );
  console.log({ addressToEmailComponents });
  if (!addressToEmailComponents) {
    return;
  }

  for (const ethAddress in addressToEmailComponents) {
    const notificationRequestsForEthAddresses =
      await getNotificationRequestsForAddress(ethAddress);

    const emailRequests = notificationRequestsForEthAddresses.filter(
      (req) => req.deliveryMethod === NotificationMethod.EMAIL,
    );

    console.log({ emailRequests });

    const allEmailSends = emailRequests.map((r) => {
      const emailComponentGenerator = addressToEmailComponents[ethAddress];

      return executeEmailSendWithSes(
        generateHTMLForEmail(emailComponentGenerator(r.id)),
        getEmailSubject(emailTrigger, entity),
        r.deliveryDestination,
      );
    });

    await Promise.all(allEmailSends);
  }
}
