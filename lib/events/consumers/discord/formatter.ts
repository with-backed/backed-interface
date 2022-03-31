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
import { collateralToDiscordMessageEmbed } from 'lib/events/consumers/discord/imageAttachmentHelper';

export async function sendBotUpdateForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  now: number,
  mostRecentTermsEvent?: LendEvent,
): Promise<void> {
  // we do not want to send LendEvent bot messages and BuyoutEvent bot messages
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  const botMessageContent = `${await generateContentStringForEvent(
    trigger,
    event,
    mostRecentTermsEvent,
  )}

Loan: <https://rinkeby.withbacked.xyz/loans/${event.loan.id}>
Event Tx: <https://rinkeby.etherscan.io/tx/${event.id}>
`;

  const messagedEmbed = await collateralToDiscordMessageEmbed(
    event.loan.collateralName,
    event.loan.collateralTokenId,
    event.loan.collateralTokenURI,
  );

  await sendBotMessage(botMessageContent, messagedEmbed);
}

async function generateContentStringForEvent(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  mostRecentTermsEvent?: LendEvent,
): Promise<string> {
  let duration: string;
  let formattedInterestEarned: string;

  switch (trigger) {
    case 'CreateEvent':
      const createEvent = event as CreateEvent;

      return `**New Loan Created**
${await ensOrAddr(createEvent.creator)} has created a loan with collateral: ${
        createEvent.loan.collateralName
      } #${createEvent.loan.collateralTokenId}

Their desired loans terms are:
${formatTermsForBot(
  createEvent.loan.loanAmount,
  createEvent.loan.loanAssetDecimal,
  createEvent.loan.perAnumInterestRate,
  createEvent.loan.durationSeconds,
  createEvent.loan.loanAssetSymbol,
)}`;
    case 'LendEvent':
      const lendEvent = event as LendEvent;

      return `**Loan Lent To**
Loan #${lendEvent.loan.id}: ${
        lendEvent.loan.collateralName
      } has been lent to by ${await ensOrAddr(lendEvent.lender)}

Their loans terms are: 
${formatTermsForBot(
  event.loan.loanAmount,
  event.loan.loanAssetDecimal,
  event.loan.perAnumInterestRate,
  event.loan.durationSeconds,
  event.loan.loanAssetSymbol,
)}`;
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

      return `**Loan Bought Out**
Loan #${buyoutEvent.loan.id}: ${
        buyoutEvent.loan.collateralName
      } has been bought out by ${newLender}
${oldLender} held the loan for ${duration} and earned ${formattedInterestEarned} ${
        buyoutEvent.loan.loanAssetSymbol
      } over that time

The old terms set by ${oldLender} were:
${formatTermsForBot(
  mostRecentTermsEvent!.loanAmount,
  buyoutEvent.loan.loanAssetDecimal,
  mostRecentTermsEvent!.perAnumInterestRate,
  mostRecentTermsEvent!.durationSeconds,
  buyoutEvent.loan.loanAssetSymbol,
)}

The new terms set by ${newLender} are:
${formatTermsForBot(
  buyoutEvent.loan.loanAmount,
  buyoutEvent.loan.loanAssetDecimal,
  buyoutEvent.loan.perAnumInterestRate,
  buyoutEvent.loan.durationSeconds,
  buyoutEvent.loan.loanAssetSymbol,
)}`;
    case 'RepaymentEvent':
      const repaymentEvent = event as RepaymentEvent;
      duration = formattedDuration(
        repaymentEvent.timestamp - repaymentEvent.loan.lastAccumulatedTimestamp,
      );
      formattedInterestEarned = ethers.utils.formatUnits(
        repaymentEvent.interestEarned,
        repaymentEvent.loan.loanAssetDecimal,
      );

      return `**Loan Repaid**
Loan #${repaymentEvent.loan.id}: ${
        repaymentEvent.loan.collateralName
      } has been repaid by ${await ensOrAddr(repaymentEvent.repayer)}
${await ensOrAddr(
  repaymentEvent.lendTicketHolder,
)} held the loan for ${duration} and earned ${formattedInterestEarned} ${
        repaymentEvent.loan.loanAssetSymbol
      } over that time
      
The loan terms were:
${formatTermsForBot(
  repaymentEvent.loan.loanAmount,
  repaymentEvent.loan.loanAssetDecimal,
  repaymentEvent.loan.perAnumInterestRate,
  repaymentEvent.loan.durationSeconds,
  repaymentEvent.loan.loanAssetSymbol,
)}`;
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

      return `**Loan Collateral Seized**
Loan #${collateralSeizureEvent.loan.id}: ${collateralSeizureEvent.loan.collateralName} has had its collateral seized
${lender} held the loan for ${duration}. The loan became due on ${maturity} with a repayment cost of ${repayment} ${collateralSeizureEvent.loan.loanAssetSymbol}. ${borrower} did not repay, so ${lender} was able to seize the loan's collateral`;
    default:
      return '';
  }
}

function formatTermsForBot(
  loanAmount: number,
  loanAssetDecimal: number,
  perAnumInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
): string {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perAnumInterestRate),
  );

  return `Loan amount: ${amount}\nDuration: ${formattedDuration(
    durationSeconds,
  )}\nInterest: ${interest}%`;
}
