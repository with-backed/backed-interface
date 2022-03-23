import aws from 'aws-sdk';

import { executeEmailSendWithSes } from './ses';
import { LendEvent, Loan } from 'types/generated/graphql/nftLoans';
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
  if (!addressToEmailComponents) {
    return;
  }

  for (const address in addressToEmailComponents) {
    const notificationRequestsForEthAddresses =
      await getNotificationRequestsForAddress(address);

    const emailAddresses = notificationRequestsForEthAddresses
      .filter((req) => req.deliveryMethod === NotificationMethod.EMAIL)
      .map((req) => req.deliveryDestination)
      .filter((value, index, self) => self.indexOf(value) === index);

    if (emailAddresses.length === 0) {
      continue;
    }

    const allEmailSends = emailAddresses.map((emailAddress) => {
      return executeEmailSendWithSes(
        generateHTMLForEmail(addressToEmailComponents[address]),
        getEmailSubject(emailTrigger, entity),
        emailAddress,
      );
    });

    await Promise.all(allEmailSends);
  }
}
