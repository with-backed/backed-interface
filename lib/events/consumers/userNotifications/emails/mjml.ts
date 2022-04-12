import mjml2html from 'mjml';
import { EventsEmailComponents } from 'lib/events/consumers/userNotifications/emails/eventsFormatter';
import { GenericEmailComponents } from 'lib/events/consumers/userNotifications/emails/genericFormatter';

const TEXT_STYLES = `font-size="14px" color="black" font-family="monospace" align="left" line-height="1.5em"`;
const ANCHOR_STYLES = `style="color: #0000EE; text-decoration:none"`;

export function generateHTMLForEventsEmail(
  components: EventsEmailComponents,
): string {
  return mjml2html(
    `
      <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${TEXT_STYLES}>&#x1F407; Backed</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>
            <a href="${components.viewLinks[0]}" ${ANCHOR_STYLES};">
              &#128196; ${components.header}
            </a>
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
        ${components.messageBeforeTerms.map(
          (message) => `
            <mj-text ${TEXT_STYLES}>${message}</mj-text>
            `,
        )}

    ${components.terms.map(
      (term) => `
    <mj-text ${TEXT_STYLES}>
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
            <mj-text ${TEXT_STYLES}>${message}</mj-text>
            `,
    )}
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>View the loan at
              <a href="${components.viewLinks[0]}" ${ANCHOR_STYLES};>
                ${components.viewLinks[0].substring(8)}
              </a>
            </mj-text>
  
        ${
          !!components.viewLinks[1] &&
          `
            <mj-text ${TEXT_STYLES}>View transaction at
                <a href="${components.viewLinks[1]}" ${ANCHOR_STYLES};>
                ${components.viewLinks[1].substring(
                  8,
                  components.viewLinks[1].length - 60,
                )}...
                </a>
            </mj-text>
            `
        }
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${ANCHOR_STYLES};>
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
  return mjml2html(
    `
      <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${TEXT_STYLES}>&#x1F407; Backed</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>
              ${components.header}
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${TEXT_STYLES}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${ANCHOR_STYLES};>
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
