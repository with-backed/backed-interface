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
      const buyoutEvent = entity as BuyoutEvent;
      return [
        buyoutEvent.lendTicketHolder,
        buyoutEvent.loan.borrowTicketHolder,
        buyoutEvent.newLender,
      ];
    case 'LendEvent':
      const lendEvent = entity as LendEvent;
      return [lendEvent.borrowTicketHolder, lendEvent.lender];
    case 'RepaymentEvent':
      const repaymentEvent = entity as RepaymentEvent;
      return [
        repaymentEvent.borrowTicketHolder,
        repaymentEvent.lendTicketHolder,
      ];
    case 'CollateralSeizureEvent':
      const collateralSeizureEvent = entity as CollateralSeizureEvent;
      return [
        collateralSeizureEvent.borrowTicketHolder,
        collateralSeizureEvent.lendTicketHolder,
      ];
    case 'LiquidationOccurring':
      const liquidationOccurringLoan = entity as Loan;
      return [
        liquidationOccurringLoan.borrowTicketHolder,
        liquidationOccurringLoan.lendTicketHolder,
      ];
    case 'LiquidationOccurred':
      const liquidationOccurredLoan = entity as Loan;
      return [
        liquidationOccurredLoan.borrowTicketHolder,
        liquidationOccurredLoan.lendTicketHolder,
      ];
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

  await executeEmailSendWithSes(params);
}
