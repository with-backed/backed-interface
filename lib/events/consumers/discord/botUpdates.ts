import { LendEvent } from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import { ensOrAddr } from '../userNotifications/helpers';
import { NotificationTriggerType } from '../userNotifications/shared';
import { formatTermsForBot } from './formattingHelpers';
import { sendBotMessage } from './notifier';

async function sendBotUpdateForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  now: number,
  mostRecentTermsEvent?: LendEvent,
) {
  // we do not want to send LendEvent emails and BuyoutEvent emails
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  let message: string;
  switch (trigger) {
    case 'LendEvent':
      const lendEvent = event as LendEvent;
      message = `Loan #${lendEvent.loan.id}: ${
        lendEvent.loan.collateralName
      } has been lent to by ${await ensOrAddr(lendEvent.lender)}\n\n`;
      message += formatTermsForBot(
        event.loan.loanAmount,
        event.loan.loanAssetDecimal,
        event.loan.perSecondInterestRate,
        event.loan.durationSeconds,
        event.loan.loanAssetSymbol,
      );
      break;
    default:
      return;
  }

  await sendBotMessage(message);
}
