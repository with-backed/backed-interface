import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ethers } from 'ethers';
import { addressToENS } from 'lib/account';
import { secondsBigNumToDaysBigNum } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { interestOverTerm, parseSubgraphLoan } from 'lib/loans/utils';
import {
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  BuyoutEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { Loan as ParsedLoan } from 'types/Loan';
import { RawSubgraphEvent } from 'types/RawEvent';
import { NotificationTriggerType } from './userNotifications/shared';

dayjs.extend(duration);

export const ensOrAddr = async (rawAddress: string): Promise<string> => {
  const ens = await addressToENS(rawAddress);
  if (ens === null) {
    return rawAddress.substring(0, 7);
  }
  return ens;
};

export const formattedDate = (timestamp: number): string =>
  dayjs.unix(timestamp).format('MM/DD/YYYY');

export const getEstimatedRepaymentAndMaturity = (
  loan: ParsedLoan,
  duration: ethers.BigNumber = loan.durationSeconds,
): [string, string] => {
  const interest = interestOverTerm(
    loan.perAnumInterestRate,
    secondsBigNumToDaysBigNum(duration),
    loan.loanAmount,
  );

  const estimatedRepayment = ethers.utils.formatUnits(
    loan.accumulatedInterest.add(interest).add(loan.loanAmount),
    loan.loanAssetDecimals,
  );

  const dateOfMaturity = formattedDate(loan.endDateTimestamp!);

  return [estimatedRepayment, dateOfMaturity];
};

export const formattedLoanTerms = (
  loanAmount: number,
  loanAssetDecimal: number,
  perAnumInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
) => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perAnumInterestRate),
  );

  return {
    amount,
    duration: formattedDuration(durationSeconds),
    interest: `${interest}%`,
  };
};

export const formattedDuration = (duration: number): string => {
  const days = Math.floor(dayjs.duration({ seconds: duration }).asDays());
  if (days != 0) {
    return days === 1 ? `${days} day` : `${days} days`;
  }

  const hours = Math.floor(dayjs.duration({ seconds: duration }).asHours());
  if (hours != 0) {
    return hours === 1 ? `${hours} hour` : `${hours} hours`;
  }

  const minutes = Math.floor(dayjs.duration({ seconds: duration }).asMinutes());
  return minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
};

export async function generateContentStringForEvent(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  bold: (str: string) => string,
  linkFormatter: (link: string) => string,
  mostRecentTermsEvent?: LendEvent,
): Promise<string> {
  let duration: string;
  let formattedInterestEarned: string;

  let message: string;

  const loanLink = linkFormatter(
    `https://rinkeby.withbacked.xyz/loans/${event.loan.id}`,
  );
  const eventLink = linkFormatter(
    `https://rinkeby.etherscan.io/tx/${event.id}`,
  );

  switch (trigger) {
    case 'CreateEvent':
      const createEvent = event as CreateEvent;

      message = `${bold('New Loan Created')}
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
      break;
    case 'LendEvent':
      const lendEvent = event as LendEvent;

      message = `${bold('Loan Lent To')}
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

      message = `${bold('Loan Bought Out')}
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

      message = `${bold('Loan Repaid')}
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

      message = `${bold('Loan Collateral Seized')}
Loan #${collateralSeizureEvent.loan.id}: ${
        collateralSeizureEvent.loan.collateralName
      } has had its collateral seized
${lender} held the loan for ${duration}. The loan became due on ${maturity} with a repayment cost of ${repayment} ${
        collateralSeizureEvent.loan.loanAssetSymbol
      }. ${borrower} did not repay, so ${lender} was able to seize the loan's collateral`;
      break;
    default:
      return '';
  }

  message += `

  Loan: ${loanLink}
  Event Tx: ${eventLink}
    `;

  return message;
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

  return `Loan amount: ${amount}
Duration: ${formattedDuration(durationSeconds)}
Interest: ${interest}%`;
}
