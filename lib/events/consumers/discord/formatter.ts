import {
  LendEvent,
  BuyoutEvent,
  RepaymentEvent,
  CollateralSeizureEvent,
  CreateEvent,
} from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import {
  ensOrAddr,
  getEstimatedRepaymentAndMaturity,
  formattedDuration,
} from 'lib/events/consumers/formattingHelpers';
import { NotificationTriggerType } from 'lib/events/consumers/userNotifications/shared';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';
import { ethers } from 'ethers';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { formattedAnnualRate } from 'lib/interest';

export async function sendBotUpdateForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  now: number,
  mostRecentTermsEvent?: LendEvent,
): Promise<void> {
  // we do not want to send LendEvent emails and BuyoutEvent emails
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  let message: string = '';

  let duration: string;
  let formattedInterestEarned: string;

  switch (trigger) {
    case 'CreateEvent':
      const createEvent = event as CreateEvent;
      message += `${await ensOrAddr(
        createEvent.creator,
      )} has created a loan with the following collateral: ${
        createEvent.loan.collateralName
      } #${createEvent.loan.collateralTokenId}\n\n`;
      message += `Their desired loans terms are:\n`;
      message += formatTermsForBot(
        createEvent.loan.loanAmount,
        createEvent.loan.loanAssetDecimal,
        createEvent.loan.perSecondInterestRate,
        createEvent.loan.durationSeconds,
        createEvent.loan.loanAssetSymbol,
      );
      break;

    case 'LendEvent':
      const lendEvent = event as LendEvent;
      message += `Loan #${lendEvent.loan.id}: ${
        lendEvent.loan.collateralName
      } has been lent to by ${await ensOrAddr(lendEvent.lender)}\n`;
      message += `Their loans terms are:\n`;
      message += formatTermsForBot(
        event.loan.loanAmount,
        event.loan.loanAssetDecimal,
        event.loan.perSecondInterestRate,
        event.loan.durationSeconds,
        event.loan.loanAssetSymbol,
      );
      break;
    case 'BuyoutEvent':
      const buyoutEvent = event as BuyoutEvent;
      const newLender = await ensOrAddr(buyoutEvent.newLender);
      const oldLender = await ensOrAddr(buyoutEvent.lendTicketHolder);
      duration = formattedDuration(
        buyoutEvent.timestamp - mostRecentTermsEvent!.timestamp,
      );
      formattedInterestEarned = ethers.utils.formatUnits(
        buyoutEvent.interestEarned,
        buyoutEvent.loan.loanAssetDecimal,
      );

      message += `Loan #${buyoutEvent.loan.id}: ${buyoutEvent.loan.collateralName} has been bought out by ${newLender}\n`;
      message += `${oldLender} held the loan for ${duration} and earned ${formattedInterestEarned} ${buyoutEvent.loan.loanAssetSymbol} over that time\n\n`;

      message += `The old terms set by ${oldLender} were:\n`;
      message += formatTermsForBot(
        mostRecentTermsEvent!.loanAmount,
        buyoutEvent.loan.loanAssetDecimal,
        mostRecentTermsEvent!.perSecondInterestRate,
        mostRecentTermsEvent!.durationSeconds,
        buyoutEvent.loan.loanAssetSymbol,
      );

      message += `\n\nThe new terms set by ${newLender} are:\n`;
      message += formatTermsForBot(
        buyoutEvent.loan.loanAmount,
        buyoutEvent.loan.loanAssetDecimal,
        buyoutEvent.loan.perSecondInterestRate,
        buyoutEvent.loan.durationSeconds,
        buyoutEvent.loan.loanAssetSymbol,
      );
      break;
    case 'RepaymentEvent':
      const repaymentEvent = event as RepaymentEvent;
      duration = formattedDuration(
        repaymentEvent.timestamp - repaymentEvent.loan.lastAccumulatedTimestamp,
      );
      formattedInterestEarned = ethers.utils.formatUnits(
        repaymentEvent.interestEarned,
        repaymentEvent.loan.loanAssetDecimal,
      );

      message += `Loan #${repaymentEvent.loan.id}: ${
        repaymentEvent.loan.collateralName
      } has been repaid by ${await ensOrAddr(repaymentEvent.repayer)}\n`;
      message += `${await ensOrAddr(
        repaymentEvent.lendTicketHolder,
      )} held the loan for ${duration} and earned ${formattedInterestEarned} ${
        repaymentEvent.loan.loanAssetSymbol
      } over that time\n\n`;

      message += 'The loan terms were:\n';
      message += formatTermsForBot(
        repaymentEvent.loan.loanAmount,
        repaymentEvent.loan.loanAssetDecimal,
        repaymentEvent.loan.perSecondInterestRate,
        repaymentEvent.loan.durationSeconds,
        repaymentEvent.loan.loanAssetSymbol,
      );
      break;
    case 'CollateralSeizureEvent':
      const collateralSeizureEvent = event as CollateralSeizureEvent;
      const borrower = await ensOrAddr(
        collateralSeizureEvent.borrowTicketHolder,
      );
      const lender = await ensOrAddr(collateralSeizureEvent.lendTicketHolder);
      duration = formattedDuration(
        collateralSeizureEvent.timestamp -
          collateralSeizureEvent.loan.lastAccumulatedTimestamp,
      );
      const [repayment, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(collateralSeizureEvent.loan),
      );

      message += `Loan #${collateralSeizureEvent.loan.id}: ${collateralSeizureEvent.loan.collateralName} has had it's collateral seized\n`;
      message += `${lender} held the loan for ${duration}. The loan became due on ${maturity} with a repayment cost of ${repayment} ${collateralSeizureEvent.loan.loanAssetSymbol}. ${borrower} did not repay, so ${lender} was able to seize the loan's collateral`;
      break;

    default:
      return;
  }

  message += `\n\nLoan: <https://rinkeby.withbacked.xyz/loans/${event.loan.id}>`;
  message += `\nEvent Tx: <https://rinkeby.etherscan.io/tx/${event.id}>`;

  await sendBotMessage(message);
}

function formatTermsForBot(
  loanAmount: number,
  loanAssetDecimal: number,
  perSecondInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
): string {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perSecondInterestRate),
  );

  return `Loan amount: ${amount}\nDuration: ${formattedDuration(
    durationSeconds,
  )}\nInterest: ${interest}%`;
}
