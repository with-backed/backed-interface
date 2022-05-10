import { RawSubgraphEvent } from 'types/RawEvent';
import { NotificationTriggerType } from 'lib/events/consumers/userNotifications/shared';
import {
  CreateEvent,
  BuyoutEvent,
  LendEvent,
  RepaymentEvent,
  CollateralSeizureEvent,
} from 'types/generated/graphql/nftLoans';
import { tweet } from 'lib/events/consumers/twitter/api';
import { getNFTInfoForAttachment } from 'lib/events/consumers/getNftInfoForAttachment';
import { nftResponseDataToImageBuffer } from 'lib/events/consumers/twitter/attachments';
import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import {
  ensOrAddr,
  formattedDuration,
  getEstimatedRepaymentAndMaturity,
} from 'lib/events/consumers/formattingHelpers';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { Config } from 'lib/config';
import capitalize from 'lodash/capitalize';

export async function sendTweetForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  config: Config,
  mostRecentTermsEvent?: LendEvent,
) {
  // we do not want to tweet for LendEvent bot messages and BuyoutEvent bot messages
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  const tweetContent = `${await generateContentStringForEvent(
    trigger,
    event,
    capitalize(config.network),
    config.jsonRpcProvider,
    mostRecentTermsEvent,
  )}

${config.siteUrl}/loans/${event.loan.id}
`;

  const attachmentImageBuffer = await nftResponseDataToImageBuffer(
    await getNFTInfoForAttachment(
      event.loan.collateralTokenURI,
      config.siteUrl,
    ),
  );

  await tweet(tweetContent, attachmentImageBuffer);
}

async function generateContentStringForEvent(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  networkName: string,
  jsonRpcProvider: string,
  mostRecentTermsEvent?: LendEvent,
): Promise<string> {
  let duration: string;
  let formattedInterestEarned: string;

  switch (trigger) {
    case 'CreateEvent':
      const createEvent = event as CreateEvent;

      return `New Loan Created on ${networkName}
${await ensOrAddr(
  createEvent.creator,
  jsonRpcProvider,
)} has created a loan with collateral: ${createEvent.loan.collateralName} #${
        createEvent.loan.collateralTokenId
      }

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

      return `Loan Lent To on ${networkName}
${truncatedLoanName(
  event.loan.id,
  event.loan.collateralName,
  event.loan.collateralTokenId,
)} has been lent to by ${await ensOrAddr(lendEvent.lender, jsonRpcProvider)}

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

      const newLender = await ensOrAddr(buyoutEvent.newLender, jsonRpcProvider);
      const oldLender = await ensOrAddr(
        buyoutEvent.lendTicketHolder,
        jsonRpcProvider,
      );
      duration = formattedDuration(
        buyoutEvent.timestamp - mostRecentTermsEvent!.timestamp,
      );
      formattedInterestEarned = ethers.utils.formatUnits(
        buyoutEvent.interestEarned,
        buyoutEvent.loan.loanAssetDecimal,
      );

      return `Loan Bought Out on ${networkName}
${truncatedLoanName(
  event.loan.id,
  event.loan.collateralName,
  event.loan.collateralTokenId,
)} has been bought out by ${newLender}

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

      return `Loan Repaid on ${networkName}
${truncatedLoanName(
  event.loan.id,
  event.loan.collateralName,
  event.loan.collateralTokenId,
)} has been repaid by ${await ensOrAddr(
        repaymentEvent.repayer,
        jsonRpcProvider,
      )}
${await ensOrAddr(
  repaymentEvent.lendTicketHolder,
  jsonRpcProvider,
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
        jsonRpcProvider,
      );
      const lender = await ensOrAddr(
        collateralSeizureEvent.lendTicketHolder,
        jsonRpcProvider,
      );
      duration = formattedDuration(
        collateralSeizureEvent.timestamp -
          collateralSeizureEvent.loan.lastAccumulatedTimestamp,
      );
      const [repayment, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(collateralSeizureEvent.loan),
      );

      return `Loan Collateral Seized on ${networkName}
${truncatedLoanName(
  event.loan.id,
  event.loan.collateralName,
  event.loan.collateralTokenId,
)} has had its collateral seized
${lender} held the loan for ${duration}. The loan became due on ${maturity} with a repayment cost of ${repayment} ${
        collateralSeizureEvent.loan.loanAssetSymbol
      }. ${borrower} did not repay, so ${lender} was able to seize the loan's collateral`;
    default:
      return '';
  }
}

const truncatedLoanName = (
  loanId: string,
  collateralName: string,
  tokenId: string,
): string =>
  collateralName.length > 15
    ? `Loan #${loanId}
${collateralName.substring(0, 14)}... #${tokenId}`
    : `Loan #${loanId} 
${collateralName} #${tokenId}`;

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

  return `${amount}
${formattedDuration(durationSeconds)}
${interest}%`;
}
