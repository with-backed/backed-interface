import mjml2html from 'mjml';

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

type EmailMetadataType = {
  subject: string;
  getTextFromEntity: (
    entity: RawSubgraphEvent | Loan,
    hasPreviousLender?: boolean,
  ) => string;
};

const notificationEventToEmailMetadata: {
  [key: string]: EmailMetadataType;
} = {
  BuyoutEvent: {
    subject: 'Your loan was bought out',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'Your loan was bought out',
  },
  LendEvent: {
    subject: 'Your loan was fulfilled',
    getTextFromEntity: (
      _entity: RawSubgraphEvent | Loan,
      hasPreviousLender?: boolean,
    ) =>
      hasPreviousLender
        ? 'The terms for one of your loans has been improved'
        : 'Your loan was fulfilled',
  },
  RepaymentEvent: {
    subject: 'Your loan was repaid',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'Your loan was repaid',
  },
  CollateralSeizureEvent: {
    subject: 'Your collateral was seized',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'Your collateral was seized',
  },
  LiquidationOccurringBorrower: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'Your NFT collateral is approaching liquidation',
  },
  LiquidationOccurringLender: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'An NFT you have lent against can be seized soon',
  },
  LiquidationOccurredBorrower: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'Your NFT collateral can be liquidated',
  },
  LiquidationOccurredLender: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromEntity: (_entity: RawSubgraphEvent | Loan) =>
      'An NFT you have lent against can be seized',
  },
};

function getRelevantEthAddressFromTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
) {
  switch (emailTrigger) {
    case 'BuyoutEvent':
      return (entity as BuyoutEvent).lendTicketHolder;
    case 'LendEvent':
      return (entity as LendEvent).borrowTicketHolder;
    case 'RepaymentEvent':
      return (entity as RepaymentEvent).lendTicketHolder;
    case 'CollateralSeizureEvent':
      return (entity as CollateralSeizureEvent).borrowTicketHolder;
    case 'LiquidationOccurringBorrower':
      return (entity as Loan).borrowTicketHolder;
    case 'LiquidationOccurringLender':
      return (entity as Loan).lendTicketHolder;
    case 'LiquidationOccurredBorrower':
      return (entity as Loan).borrowTicketHolder;
    case 'LiquidationOccurredLender':
      return (entity as Loan).lendTicketHolder;
    default:
      return '';
  }
}

export async function sendEmailsForTriggerAndEntity(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  hasPreviousLender: boolean = false,
) {
  const ethAddress = getRelevantEthAddressFromTriggerAndEntity(
    emailTrigger,
    entity,
  );
  console.log('would have sent emails for users subscribed to ', ethAddress);
  const notificationRequestsForEthAddress =
    await getNotificationRequestsForAddress(ethAddress);
  const emailAddresses = notificationRequestsForEthAddress
    .filter((req) => req.deliveryMethod === NotificationMethod.EMAIL)
    .map((req) => req.deliveryDestination);

  if (emailAddresses.length === 0) {
    return;
  }

  const params = {
    Source: process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!,
    Destination: {
      ToAddresses: emailAddresses,
    },
    ReplyToAddresses: [process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: generateHTMLForEmail(
            notificationEventToEmailMetadata[emailTrigger]!.getTextFromEntity(
              entity,
              hasPreviousLender,
            ),
          ),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: notificationEventToEmailMetadata[emailTrigger]!.subject,
      },
    },
  };
  await executeEmailSendWithSes(params);
}

// todo(adamgobes); actually style these email tags to make them look good rather than just plain text
function generateHTMLForEmail(text: string): string {
  return mjml2html(
    `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            ${text}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`,
    {},
  ).html;
}
