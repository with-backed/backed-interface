import mjml2html from 'mjml';

import { NotificationEventTrigger } from './shared';
import { executeEmailSendWithSes } from './ses';
import { Loan } from 'types/generated/graphql/nftLoans';

type EmailMetadataType = {
  subject: string;
  getTextFromLoan: (loan: Loan) => string;
};

const notificationEventToEmailMetadata: {
  [key in NotificationEventTrigger]?: EmailMetadataType;
} = {
  [NotificationEventTrigger.BuyoutEventBorrower]: {
    subject: 'Your loan was bought out',
    getTextFromLoan: (_loan: Loan) =>
      'The terms for one of your loans has been improved',
  },
  [NotificationEventTrigger.BuyoutEventOldLender]: {
    subject: 'Your loan was bought out',
    getTextFromLoan: (_loan: Loan) => 'Your loan was bought out',
  },
  [NotificationEventTrigger.LendEvent]: {
    subject: 'Your loan was fulfilled',
    getTextFromLoan: (_loan: Loan) => 'Your loan was fulfilled',
  },
  [NotificationEventTrigger.RepaymentEvent]: {
    subject: 'Your loan was repaid',
    getTextFromLoan: (_loan: Loan) => 'Your loan was repaid',
  },
  [NotificationEventTrigger.CollateralSeizureEvent]: {
    subject: 'Your collateral was seized',
    getTextFromLoan: (_loan: Loan) => 'Your collateral was seized',
  },
  [NotificationEventTrigger.LiquidationOccurringBorrower]: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromLoan: (_loan: Loan) =>
      'Your NFT collateral is approaching liquidation',
  },
  [NotificationEventTrigger.LiquidationOccurringLender]: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromLoan: (_loan: Loan) =>
      'An NFT you have lent against can be seized soon',
  },
  [NotificationEventTrigger.LiquidationOccurredBorrower]: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromLoan: (_loan: Loan) => 'Your NFT collateral can be liquidated',
  },
  [NotificationEventTrigger.LiquidationOccurredLender]: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromLoan: (_loan: Loan) =>
      'An NFT you have lent against can be seized',
  },
};

export async function sendEmail(
  emailAddress: string,
  notificationEventTrigger: NotificationEventTrigger,
  loan: Loan,
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
            notificationEventToEmailMetadata[
              notificationEventTrigger
            ]!.getTextFromLoan(loan),
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
