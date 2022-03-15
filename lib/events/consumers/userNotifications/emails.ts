import { executeEmailSendWithSes } from './ses';
import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { NotificationMethod, NotificationTriggerType } from './shared';
import { RawSubgraphEvent } from 'types/RawEvent';
import { getNotificationRequestsForAddress } from './repository';
import fs from 'fs';
import { generateHTMLForEmail } from './mjml';
import { getEmailComponents, getEmailSubject } from './formatter';

function getRelevantEthAddressesFromTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
): string[] {
  switch (emailTrigger) {
    case 'BuyoutEvent':
      return [(entity as BuyoutEvent).lendTicketHolder];
    case 'LendEvent':
      return [(entity as LendEvent).borrowTicketHolder];
    case 'RepaymentEvent':
      return [(entity as RepaymentEvent).lendTicketHolder];
    case 'CollateralSeizureEvent':
      return [(entity as CollateralSeizureEvent).borrowTicketHolder];
    case 'LiquidationOccurring':
      return [(entity as Loan).borrowTicketHolder];
    case 'LiquidationOccurred':
      return [(entity as Loan).borrowTicketHolder];
    default:
      return [];
  }
}

export async function sendEmailsForTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
) {
  const ethAddresses = getRelevantEthAddressesFromTriggerAndEntity(
    emailTrigger,
    entity,
  );

  const notificationRequestsForEthAddresses = (
    await Promise.all(
      ethAddresses.map((ethAddress) =>
        getNotificationRequestsForAddress(ethAddress),
      ),
    )
  ).flat();

  const emailAddresses = notificationRequestsForEthAddresses
    .filter((req) => req.deliveryMethod === NotificationMethod.EMAIL)
    .map((req) => req.deliveryDestination);

  if (emailAddresses.length === 0) {
    return;
  }

  const emailComponents = await getEmailComponents(emailTrigger, entity, now);
  if (!emailComponents) {
    return;
  }

  const params = {
    Source: 'adamgobes@gmail.com', // TODO(adamgobes): change this, only using for tests
    Destination: {
      ToAddresses: emailAddresses,
    },
    ReplyToAddresses: ['adamgobes@gmail.com'],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: generateHTMLForEmail(emailComponents),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: await getEmailSubject(emailTrigger, entity),
      },
    },
  };

  console.log(params.Message.Body.Html);
  await executeEmailSendWithSes(params);
}
