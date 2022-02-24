import mjml2html from 'mjml';
import aws from 'aws-sdk';

import { NotificationEventTrigger } from './shared';

const sesConfig = {
  region: 'us-east-1', // Change it to match your region
  credentials: {
    accessKeyId: 'AKIAZEACKAGKWKKWV54C',
    secretAccessKey: 'nWhANLEpnJBM1LMg3PNnkjVq2ApvZhLmnk4S8fb+',
  },
};

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
    text: 'Your loan was bought out',
  },
};

// TODO(adamgobes): Fill this out with actual email logic
export async function sendEmail(
  emailAddress: string,
  notificationEventTrigger: NotificationEventTrigger,
) {
  const params = {
    Source: 'adamgobes@gmail.com',
    Destination: {
      ToAddresses: ['gobran.ny@gmail.com'],
    },
    ReplyToAddresses: ['adamgobes@gmail.com'],
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

  const res = await new aws.SES(sesConfig).sendEmail(params).promise();
  console.log(res);
}

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

sendEmail('', NotificationEventTrigger.ALL)
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
