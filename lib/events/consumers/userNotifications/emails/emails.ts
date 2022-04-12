import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/emails/ses';
import { LendEvent, Loan } from 'types/generated/graphql/nftLoans';
import { NotificationMethod, NotificationTriggerType } from '../shared';
import { RawSubgraphEvent } from 'types/RawEvent';
import { getNotificationRequestsForAddress } from '../repository';
import {
  generateHTMLForEventsEmail,
  generateHTMLForGenericEmail,
} from './mjml';
import { getEmailComponentsMap, getEmailSubject } from './eventsFormatter';
import { ensOrAddr } from '../../formattingHelpers';
import {
  GenericEmailComponents,
  GenericEmailType,
  getSubjectForGenericEmail,
} from './genericFormatter';

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

  for (const ethAddress in addressToEmailComponents) {
    const notificationRequestsForEthAddresses =
      await getNotificationRequestsForAddress(ethAddress);

    const emailRequests = notificationRequestsForEthAddresses.filter(
      (req) => req.deliveryMethod === NotificationMethod.EMAIL,
    );

    const allEmailSends = emailRequests.map((r) => {
      const emailComponentGenerator = addressToEmailComponents[ethAddress];

      return executeEmailSendWithSes(
        generateHTMLForEventsEmail(emailComponentGenerator(r.id)),
        getEmailSubject(emailTrigger, entity),
        r.deliveryDestination,
      );
    });

    await Promise.all(allEmailSends);
  }
}

export async function sendConfirmationEmail(
  destination: string,
  ethAddress: string,
  unsubscribeUuid: string,
) {
  // TODO(adamgobes): return if we are local

  const confirmationEmailComponents: GenericEmailComponents = {
    header: 'Email request received for Backed',
    mainMessage: `We've received your request to subscribe to the activity of ${await ensOrAddr(
      ethAddress,
    )}`,
    footer: `https://nftpawnshop.xyz/profile/${ethAddress}?unsubscribe=true&uuid=${unsubscribeUuid}`,
  };

  await executeEmailSendWithSes(
    generateHTMLForGenericEmail(confirmationEmailComponents),
    getSubjectForGenericEmail(GenericEmailType.CONFIRMATION),
    destination,
  );
}
