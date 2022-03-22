import aws from 'aws-sdk';
import fs from 'fs';

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
import { generateHTMLForEmail } from './mjml';
import { getEmailComponentsMap, getEmailSubject } from './formatter';

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

const baseParams: aws.SES.Types.SendEmailRequest = {
  Source: 'adamgobes@gmail.com', // TODO(adamgobes): change this, only using for tests
  Destination: {
    ToAddresses: [],
  },
  ReplyToAddresses: ['adamgobes@gmail.com'],
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: '',
      },
    },
    Subject: {
      Charset: 'UTF-8',
      Data: '',
    },
  },
};

export async function sendEmailsForTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
  mostRecentTermsEvent?: LendEvent,
) {
  console.log({ mostRecentTermsEvent });

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

  console.log({ keyz: Object.keys(addressToEmailComponents) });

  for (const address in addressToEmailComponents) {
    console.log({ address });
    const notificationRequestsForEthAddresses =
      await getNotificationRequestsForAddress(address);

    const emailAddresses = notificationRequestsForEthAddresses
      .filter((req) => req.deliveryMethod === NotificationMethod.EMAIL)
      .map((req) => req.deliveryDestination);

    console.log({ emailAddresses });

    if (emailAddresses.length === 0) {
      continue;
    }

    console.log(addressToEmailComponents[address].mainMessage);

    const params = {
      ...baseParams,
    };
    params.Message.Body.Html!.Data = generateHTMLForEmail(
      addressToEmailComponents[address],
    );
    params.Message.Subject.Data = await getEmailSubject(emailTrigger, entity);

    const allEmailSends = emailAddresses.map((emailAddress) => {
      params.Destination.ToAddresses = [emailAddress];
      return executeEmailSendWithSes(params);
    });

    await Promise.all(allEmailSends);
  }
}
