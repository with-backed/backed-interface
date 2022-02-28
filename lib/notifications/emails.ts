import mjml2html from 'mjml';

import { NotificationEventTrigger } from './shared';
import { executeEmailSendWithSes } from './ses';

// TODO(adamgobes): text field should be function that takes Loan as param
const notificationEventToEmailMetadata: {
  [key in NotificationEventTrigger]?: { subject: string; text: string };
} = {
  [NotificationEventTrigger.BuyoutEvent]: {
    subject: 'Your loan was bought out',
    text: 'Your loan was bought out',
  },
  [NotificationEventTrigger.LendEvent]: {
    subject: 'Your loan was fulfilled',
    text: 'Your loan was fulfilled',
  },
  [NotificationEventTrigger.RepaymentEvent]: {
    subject: 'Your loan was repaid',
    text: 'Your loan was repaid',
  },
  [NotificationEventTrigger.CollateralSeizureEvent]: {
    subject: 'Your collateral was seized',
    text: 'Your collateral was seized',
  },
  [NotificationEventTrigger.LiquidationOccurring]: {
    subject: 'Your NFT collateral is approaching liquidation',
    text: 'Your NFT collateral is approaching liquidation',
  },
  [NotificationEventTrigger.LiquidationOccurred]: {
    subject: 'Your NFT collateral can be liquidated',
    text: 'Your NFT collateral can be liquidated',
  },
};

export async function sendEmail(
  emailAddress: string,
  notificationEventTrigger: NotificationEventTrigger,
) {
  const params = {
    Source: process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!,
    Destination: {
      ToAddresses: [emailAddress],
    },
    ReplyToAddresses: [process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: generateHTMLForEmail(
            notificationEventToEmailMetadata[notificationEventTrigger]!.text,
          ),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: notificationEventToEmailMetadata[notificationEventTrigger]!
          .subject,
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
