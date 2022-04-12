import mjml2html from 'mjml';
import { EventsEmailComponents } from 'lib/events/consumers/userNotifications/emails/eventsFormatter';
import { GenericEmailComponents } from './genericFormatter';

export function generateHTMLForEventsEmail(
  components: EventsEmailComponents,
): string {
  const textStyles = `font-size="14px" color="black" font-family="monospace" align="left" line-height="1.5em"`;
  const anchorStyles = `style="color: #0000EE; text-decoration:none"`;

  return mjml2html(
    `
      <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${textStyles}>&#128184; NFT Pawn Shop</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>
            <a href="${components.viewLinks[0]}" ${anchorStyles};">
              &#128196; ${components.header}
            </a>
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
        ${components.messageBeforeTerms.map(
          (message) => `
            <mj-text ${textStyles}>${message}</mj-text>
            `,
        )}

    ${components.terms.map(
      (term) => `
    <mj-text ${textStyles}>
      ${term.prefix}
      <pre style="margin-bottom:0px">
    Loan amount:     ${term.amount}
    Duration:        ${term.duration}
    Interest:        ${term.interest}</pre>
    </mj-text>
    `,
    )}

    ${components.messageAfterTerms.map(
      (message) => `
            <mj-text ${textStyles}>${message}</mj-text>
            `,
    )}
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>View the loan at
              <a href="${components.viewLinks[0]}" ${anchorStyles};>
                ${components.viewLinks[0].substring(8)}
              </a>
            </mj-text>
  
        ${
          !!components.viewLinks[1] &&
          `
            <mj-text ${textStyles}>View transaction at
                <a href="${components.viewLinks[1]}" ${anchorStyles};>
                ${components.viewLinks[1].substring(
                  8,
                  components.viewLinks[1].length - 60,
                )}...
                </a>
            </mj-text>
            `
        }
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${anchorStyles};>
              ${components.footer.substring(
                8,
                components.footer.length - 36,
              )}...
            </a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `,
    {},
  ).html;
}

export function generateHTMLForGenericEmail(
  components: GenericEmailComponents,
): string {
  const textStyles = `font-size="14px" color="black" font-family="monospace" align="left" line-height="1.5em"`;
  const anchorStyles = `style="color: #0000EE; text-decoration:none"`;

  return mjml2html(
    `
      <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${textStyles}>&#128184; NFT Pawn Shop</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>
              ${components.header}
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${textStyles}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${anchorStyles};>
              ${components.footer.substring(
                8,
                components.footer.length - 36,
              )}...
            </a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `,
    {},
  ).html;
}
