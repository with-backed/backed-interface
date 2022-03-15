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
import fs from 'fs';
import { notificationEventToEmailMetadata } from './formatter';

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
  hasPreviousLender: boolean = false,
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
            await notificationEventToEmailMetadata[
              emailTrigger
            ]!.getComponentsFromEntity(entity, hasPreviousLender),
          ),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: notificationEventToEmailMetadata[emailTrigger]!.subject,
      },
    },
  };

  await fs.writeFileSync('./html.txt', params.Message.Body.Html.Data);

  console.log(params.Message.Body.Html);
  await executeEmailSendWithSes(params);
}

// todo(adamgobes); actually style these email tags to make them look good rather than just plain text
function generateHTMLForEmail(components: EmailComponents): string {
  const reusableTextStyles = `font-size="14px" color="black" font-family="lato" align="left"`;

  return mjml2html(
    `
    <mjml>
    <mj-head>
      <mj-font name="lato" href="https://fonts.googleapis.com/css2?family=Lato" />
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text ${reusableTextStyles}>&#128184; NFT Pawn Shop</mj-text>
  
          <mj-divider border-width="1px"></mj-divider>
  
          <mj-text ${reusableTextStyles}>${components.header}</mj-text>
  
          <mj-divider border-style="dashed" border-width="1px"></mj-divider>
  
          <mj-text ${reusableTextStyles}>${components.mainMessage}</mj-text>
  
          <mj-divider border-style="dashed" border-width="1px"></mj-divider>
  
          ${components.loanDetails.map(
            (detail) => `
          <mj-text ${reusableTextStyles}>${detail}</mj-text>
          `,
          )}
  
          <mj-divider border-style="dashed" border-width="1px"></mj-divider>
  
          <mj-text ${reusableTextStyles}>View the loan at 
            <a href="https://example.com" padding="0px" style="color: #0000EE;">
              ${components.viewLinks[0]}
            </a>
          </mj-text>

          <mj-text ${reusableTextStyles}>View the loan at
            <a href="https://example.com" style="color: #0000EE;">
              ${components.viewLinks[1]}
            </a>
          </mj-text>
  
          <mj-divider border-style="dashed" border-width="1px"></mj-divider>
  
          <mj-text ${reusableTextStyles}>This is an automatically generated email. To stop notifications, visit ${
      components.footer
    }</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`,
    {},
  ).html;
}
