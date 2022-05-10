import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/emails/ses';
import { LendEvent, Loan } from 'types/generated/graphql/nftLoans';
import {
  NotificationMethod,
  NotificationTriggerType,
} from 'lib/events/consumers/userNotifications/shared';
import { RawSubgraphEvent } from 'types/RawEvent';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import {
  generateHTMLForEventsEmail,
  generateHTMLForGenericEmail,
} from './mjml';
import {
  getEmailComponentsMap,
  getEmailSubject,
} from 'lib/events/consumers/userNotifications/emails/eventsFormatter';
import { ensOrAddr } from 'lib/events/consumers/formattingHelpers';
import {
  GenericEmailComponents,
  GenericEmailType,
  getSubjectForGenericEmail,
} from 'lib/events/consumers/userNotifications/emails/genericFormatter';
import { Config } from 'lib/config';

export async function sendEmailsForTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
  config: Config,
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
    config,
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
        `${config.emailSubjectPrefix} ${getEmailSubject(emailTrigger, entity)}`,
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
  siteUrl: string,
  jsonRpcProvider: string,
) {
  if (!process.env.VERCEL_ENV) {
    return;
  }

  const confirmationEmailComponents: GenericEmailComponents = {
    mainMessage: `We've received your request to subscribe to the activity of ${await ensOrAddr(
      ethAddress,
      jsonRpcProvider,
    )}`,
    footer: `https://${siteUrl}/profile/${ethAddress}?unsubscribe=true&uuid=${unsubscribeUuid}`,
  };

  await executeEmailSendWithSes(
    generateHTMLForGenericEmail(confirmationEmailComponents),
    getSubjectForGenericEmail(GenericEmailType.CONFIRMATION),
    destination,
  );
}
