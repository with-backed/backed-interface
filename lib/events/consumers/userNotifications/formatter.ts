import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import { secondsToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { ethers } from 'ethers';
import { SCALAR } from 'lib/constants';
import dayjs from 'dayjs';
import { getMostRecentTermsForLoan } from 'lib/loans/subgraph/subgraphLoans';
import { Loan as ParsedLoan } from 'types/Loan';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { NotificationTriggerType } from './shared';

export type EmailComponents = {
  header: string;
  mainMessage: string;
  loanDetails: string[];
  viewLinks: [string, string];
  footer: string;
};

type EmailMetadataType = {
  getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) => string;
  getComponentsFromEntity: (
    entity: RawSubgraphEvent | Loan,
    now: number,
  ) => Promise<EmailComponents>;
};

const ensOrAddr = async (rawAddress: string) => rawAddress.substring(0, 7);

const emailHeader = (loan: Loan): string =>
  `Loan #${loan.id}: ${loan.collateralName}`;

const formattedLoanInfoFromParams = (
  loanAmount: number,
  loanAssetDecimal: number,
  perSecondInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
): string => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;
  const days = secondsToDays(durationSeconds)
    .toFixed(2)
    .replace(/[.,]00$/, '');
  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perSecondInterestRate),
  );

  return `[${amount}, ${days} days, ${interest}%]`;
};

const getEstimatedRepaymentAndMaturity = (
  loan: ParsedLoan,
  duration: ethers.BigNumber = loan.durationSeconds,
): [string, string] => {
  const interestOverTerm = loan.perSecondInterestRate
    .mul(duration)
    .mul(loan.loanAmount)
    .div(SCALAR);

  const estimatedRepayment = ethers.utils.formatUnits(
    loan.accumulatedInterest.add(interestOverTerm).add(loan.loanAmount),
    loan.loanAssetDecimals,
  );

  const dateOfMaturity = dayjs
    .unix(loan.endDateTimestamp!)
    .format('DD/MM/YYYY');

  return [estimatedRepayment, dateOfMaturity];
};

const formattedDuration = (duration: number): string => {
  const days = Math.floor(dayjs.duration({ seconds: duration }).asDays());
  if (days != 0) {
    return `${days} days`;
  }

  const hours = Math.floor(dayjs.duration({ seconds: duration }).asHours());
  if (hours != 0) {
    return `${hours} hours`;
  }

  const minutes = Math.floor(dayjs.duration({ seconds: duration }).asMinutes());
  return `${minutes} minutes`;
};

export async function getEmailSubject(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
): Promise<string> {
  const emailMetadata = notificationEventToEmailMetadata[emailTrigger];
  if (!emailMetadata) {
    // fatal bugsnag, invalid email trigger was passed from SNS push
    return '';
  }
  return emailMetadata.getSubjectFromEntity(entity);
}

export async function getEmailComponents(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
): Promise<EmailComponents | null> {
  const emailMetadata = notificationEventToEmailMetadata[emailTrigger];
  if (!emailMetadata) {
    // fatal bugsnag, invalid email trigger was passed from SNS push
    return null;
  }

  return await emailMetadata.getComponentsFromEntity(entity, now);
}

const notificationEventToEmailMetadata: {
  [key: string]: EmailMetadataType;
} = {
  BuyoutEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as BuyoutEvent).loan.id} has a new lender`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const event = entity as BuyoutEvent;
      const oldLender = await ensOrAddr(event.lendTicketHolder);
      const newLender = await ensOrAddr(event.newLender);
      const formattedInterestEarned = ethers.utils.formatUnits(
        event.interestEarned,
        event.loan.loanAssetDecimal,
      );

      const oldTermsEvent = await getMostRecentTermsForLoan(event.loan.id);
      if (!oldTermsEvent) {
        // fatal bugsnag here, this will literally be impossible unless EVM breaks lol
      }

      const [repayment, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(event.loan),
      );

      return {
        header: emailHeader(event.loan),
        mainMessage: `${newLender} replaced ${oldLender} as lender`,
        loanDetails: [
          `${oldLender} held the loan for ${formattedDuration(
            event.timestamp - oldTermsEvent!.timestamp,
          )} and accrued ${formattedInterestEarned} ${
            event.loan.loanAssetSymbol
          } in interest over that period.`,
          `Their loan terms were ${formattedLoanInfoFromParams(
            oldTermsEvent!.loanAmount,
            event.loan.loanAssetDecimal,
            oldTermsEvent!.perSecondInterestRate,
            oldTermsEvent!.durationSeconds,
            event.loan.loanAssetSymbol,
          )}.`,
          `The new terms set by ${newLender} are ${formattedLoanInfoFromParams(
            event.loan.loanAmount,
            event.loan.loanAssetDecimal,
            event.loan.perSecondInterestRate,
            event.loan.durationSeconds,
            event.loan.loanAssetSymbol,
          )}`,
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
        footer: `https://nftpawnshop.xyz/profile/${event.lendTicketHolder}`,
      };
    },
  },
  LendEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as LendEvent).loan.id} has been fulfilled`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const event = entity as LendEvent;
      const borrower = await ensOrAddr(event.borrowTicketHolder);
      const lender = await ensOrAddr(event.lender);
      const [repayment, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(event.loan),
      );

      return {
        header: emailHeader(event.loan),
        mainMessage: `The loan created by ${borrower} has been lent to by ${lender}`,
        loanDetails: [
          `${lender} lent at terms ${formattedLoanInfoFromParams(
            event.loan.loanAmount,
            event.loan.loanAssetDecimal,
            event.loan.perSecondInterestRate,
            event.loan.durationSeconds,
            event.loan.loanAssetSymbol,
          )}.`,
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
        footer: `https://nftpawnshop.xyz/profile/${event.borrowTicketHolder}`,
      };
    },
  },
  RepaymentEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as RepaymentEvent).loan.id} has been repaid`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const event = entity as RepaymentEvent;
      const repayer = await ensOrAddr(event.repayer);
      const lender = await ensOrAddr(event.lendTicketHolder);
      const formattedInterestEarned = ethers.utils.formatUnits(
        event.interestEarned,
        event.loan.loanAssetDecimal,
      );
      const formattedTotalRepay = ethers.utils.formatUnits(
        ethers.BigNumber.from(event.interestEarned).add(
          ethers.BigNumber.from(event.loan.loanAmount),
        ),
        event.loan.loanAssetDecimal,
      );

      return {
        header: emailHeader(event.loan),
        mainMessage: `${repayer} repaid the loan`,
        loanDetails: [
          `${lender} held the loan for ${formattedDuration(
            event.timestamp - event.loan.lastAccumulatedTimestamp,
          )}, with loan terms of ${formattedLoanInfoFromParams(
            event.loan.loanAmount,
            event.loan.loanAssetDecimal,
            event.loan.perSecondInterestRate,
            event.loan.durationSeconds,
            event.loan.loanAssetSymbol,
          )}, and accrued ${formattedInterestEarned} ${
            event.loan.loanAssetSymbol
          } over that period.`,
          `The total cost to repay was ${formattedTotalRepay} ${event.loan.loanAssetSymbol}.`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
        footer: `https://nftpawnshop.xyz/profile/${event.lendTicketHolder}`,
      };
    },
  },
  CollateralSeizureEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${
        (entity as CollateralSeizureEvent).loan.id
      } collateral has been seized`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const event = entity as CollateralSeizureEvent;
      const borrower = await ensOrAddr(event.borrowTicketHolder);
      const lender = await ensOrAddr(event.lendTicketHolder);
      const [repayment, _] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(event.loan),
      );

      return {
        header: emailHeader(event.loan),
        mainMessage: `Lender ${lender} has seized the collateral NFT on Loan #${event.loan.id}`,
        loanDetails: [
          `${lender} held the loan for ${formattedDuration(
            event.timestamp - event.loan.lastAccumulatedTimestamp,
          )} at terms ${formattedLoanInfoFromParams(
            event.loan.loanAmount,
            event.loan.loanAssetDecimal,
            event.loan.perSecondInterestRate,
            event.loan.durationSeconds,
            event.loan.loanAssetSymbol,
          )}.`,
          `The loan became due on ${dayjs
            .unix(event.loan.endDateTimestamp!)
            .format('DD/MM/YYYY')} with a repayment cost of ${repayment} ${
            event.loan.loanAssetSymbol
          }.`,
          `Borrower ${borrower} did not repay, so ${lender} was able to seize the collateral NFT on ${dayjs
            .unix(event.timestamp)
            .format('DD/MM/YYYY')}.`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
        footer: `https://nftpawnshop.xyz/profile/${event.borrowTicketHolder}`,
      };
    },
  },
  LiquidationOccurring: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as Loan).id} is approaching due`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      now: number,
    ) => {
      const loan = entity as Loan;
      const lender = await ensOrAddr(loan.lendTicketHolder);

      const loanDuration = now - loan.lastAccumulatedTimestamp;

      const [interestAccruedSoFar, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(loan),
        ethers.BigNumber.from(loanDuration),
      );
      const [repayment, _] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(loan),
      );

      return {
        header: emailHeader(loan),
        mainMessage: 'This loan will be due in 24 hours',
        loanDetails: [
          `${lender} held the loan for ${formattedDuration(
            loanDuration,
          )}, with loan terms ${formattedLoanInfoFromParams(
            loan.loanAmount,
            loan.loanAssetDecimal,
            loan.perSecondInterestRate,
            loan.durationSeconds,
            loan.loanAssetSymbol,
          )}, and accrued ${interestAccruedSoFar} ${
            loan.loanAssetSymbol
          } over that period.`,
          `At this rate, repayment of ${repayment} ${loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [`https://nftpawnshop.xyz/loans/${loan.id}`, ''],
        footer: `https://nftpawnshop.xyz`,
      };
    },
  },
  LiquidationOccurred: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as Loan).id} is past due`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const loan = entity as Loan;
      const lender = await ensOrAddr(loan.lendTicketHolder);
      const borrower = await ensOrAddr(loan.borrowTicketHolder);

      const loanDuration =
        loan.endDateTimestamp! - loan.lastAccumulatedTimestamp;
      const [repayment, _] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(loan),
      );
      const formattedInterestAccrued = ethers.utils.formatUnits(
        ethers.utils
          .parseUnits(repayment, loan.loanAssetDecimal)
          .sub(ethers.BigNumber.from(loan.loanAmount)),
        loan.loanAssetDecimal,
      );

      return {
        header: emailHeader(loan),
        mainMessage:
          'The loan is past due, and its NFT collateral may be seized',
        loanDetails: [
          `${lender} held the loan for ${formattedDuration(
            loanDuration,
          )}, with loan terms ${formattedLoanInfoFromParams(
            loan.loanAmount,
            loan.loanAssetDecimal,
            loan.perSecondInterestRate,
            loan.durationSeconds,
            loan.loanAssetSymbol,
          )}, and accrued ${formattedInterestAccrued} ${loan.loanAssetSymbol}`,
          `The loan became due on ${dayjs
            .unix(loan.endDateTimestamp!)
            .format('DD/MM/YYYY')} with a repayment cost of ${repayment} ${
            loan.loanAssetSymbol
          }`,
          `Unless borrower ${borrower} repays, ${lender} may seize the collateral NFT.`,
        ],
        viewLinks: [`https://nftpawnshop.xyz/loans/${loan.id}`, ''],
        footer: `https://nftpawnshop.xyz`,
      };
    },
  },
};
