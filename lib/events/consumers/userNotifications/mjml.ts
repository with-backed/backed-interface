import mjml2html from 'mjml';
import { EmailComponents } from './formatter';

// todo(adamgobes); actually style these email tags to make them look good rather than just plain text
export function generateHTMLForEmail(components: EmailComponents): string {
  const reusableTextStyles = `font-size="14px" color="black" font-family="monospace" align="left" line-height="1.5em"`;
  const reusableAnchorStyles = `style="color: #0000EE; text-decoration:none"`;

  return mjml2html(
    `
      <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${reusableTextStyles}>&#128184; NFT Pawn Shop</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>
            <a href="${components.viewLinks[0]}" ${reusableAnchorStyles};">
              &#128196; ${components.header}
            </a>
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
        ${components.messageBeforeTerms.map(
          (message) => `
            <mj-text ${reusableTextStyles}>${message}</mj-text>
            `,
        )}

    ${components.terms.map(
      (term) => `
    <mj-text ${reusableTextStyles}>
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
            <mj-text ${reusableTextStyles}>${message}</mj-text>
            `,
    )}
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>View the loan at
              <a href="${components.viewLinks[0]}" ${reusableAnchorStyles};>
                ${components.viewLinks[0].substring(8)}
              </a>
            </mj-text>
  
        ${
          !!components.viewLinks[1] &&
          `
            <mj-text ${reusableTextStyles}>View transaction at
                <a href="${components.viewLinks[1]}" ${reusableAnchorStyles};>
                ${components.viewLinks[1].substring(
                  8,
                  components.viewLinks[1].length - 60,
                )}...
                </a>
            </mj-text>
            `
        }
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${reusableAnchorStyles};>
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
