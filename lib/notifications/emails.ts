import mjml2html from 'mjml';

import { executeEmailSendWithSes } from './ses';
import { Loan } from 'types/generated/graphql/nftLoans';
import { NotificationTriggerType } from './shared';

type EmailMetadataType = {
  subject: string;
  getTextFromLoan: (loan: Loan, hasPreviousLender?: boolean) => string;
};

const notificationEventToEmailMetadata: {
  [key: string]: EmailMetadataType;
} = {
  BuyoutEvent: {
    subject: 'Your loan was bought out',
    getTextFromLoan: (_loan: Loan) => 'Your loan was bought out',
  },
  LendEvent: {
    subject: 'Your loan was fulfilled',
    getTextFromLoan: (_loan: Loan, hasPreviousLender?: boolean) =>
      hasPreviousLender
        ? 'The terms for one of your loans has been improved'
        : 'Your loan was fulfilled',
  },
  RepaymentEvent: {
    subject: 'Your loan was repaid',
    getTextFromLoan: (_loan: Loan) => 'Your loan was repaid',
  },
  CollateralSeizureEvent: {
    subject: 'Your collateral was seized',
    getTextFromLoan: (_loan: Loan) => 'Your collateral was seized',
  },
  LiquidationOccurringBorrower: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromLoan: (_loan: Loan) =>
      'Your NFT collateral is approaching liquidation',
  },
  LiquidationOccurringLender: {
    subject: 'Your NFT collateral is approaching liquidation',
    getTextFromLoan: (_loan: Loan) =>
      'An NFT you have lent against can be seized soon',
  },
  LiquidationOccurredBorrower: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromLoan: (_loan: Loan) => 'Your NFT collateral can be liquidated',
  },
  LiquidationOccurredLender: {
    subject: 'Your NFT collateral can be liquidated',
    getTextFromLoan: (_loan: Loan) =>
      'An NFT you have lent against can be seized',
  },
};

export async function sendEmail(
  emailAddress: string,
  emailTrigger: NotificationTriggerType,
  loan: Loan,
  hasPreviousLender: boolean = false,
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
            notificationEventToEmailMetadata[emailTrigger]!.getTextFromLoan(
              loan,
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
