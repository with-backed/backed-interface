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
  subject: string;
  getComponentsFromEntity: (
    entity: RawSubgraphEvent | Loan,
    now: number,
  ) => Promise<EmailComponents>;
};

const ensOrAddr = async (rawAddress: string) => rawAddress.substring(0, 7);

const emailHeader = (loan: Loan): string =>
  `Loan #${loan.id}: ${loan.collateralName}`;

const formattedTermsFromLoan = (loan: Loan): string => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loan.loanAmount.toString(),
    loan.loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loan.loanAssetSymbol}`;
  const days = secondsToDays(loan.durationSeconds);
  const interest = formattedAnnualRate(
    ethers.BigNumber.from(loan.perSecondInterestRate),
  );

  return `[${amount}, ${days} days, ${interest}%]`;
};

const formattedTermsFromEvent = (
  event: LendEvent,
  loanAssetSymbol: string,
): string => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    event.loanAmount.toString(),
    event.loan.loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;
  const days = secondsToDays(event.durationSeconds);
  const interest = formattedAnnualRate(
    ethers.BigNumber.from(event.perSecondInterestRate),
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
  return emailMetadata.subject;
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

  console.log({ entity, now });

  return await emailMetadata.getComponentsFromEntity(entity, now);
}

const notificationEventToEmailMetadata: {
  [key: string]: EmailMetadataType;
} = {
  BuyoutEvent: {
    subject: 'Loan # has a new lender',
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      console.log({ entityFromGet: entity });
      const event = entity as BuyoutEvent;
      console.log({ eventFromGet: event });
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
          `Their loan terms were ${formattedTermsFromEvent(
            oldTermsEvent!,
            event.loan.loanAssetSymbol,
          )}.`,
          `The new terms set by ${newLender} are ${formattedTermsFromLoan(
            event.loan,
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
    subject: 'Loan # has been fulfilled',
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
          `${lender} lent at terms ${formattedTermsFromLoan(event.loan)}.`,
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
    subject: 'Loan # has been repaid',
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
          )}, with loan terms of ${formattedTermsFromLoan(
            event.loan,
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
    subject: 'Loan # collateral has been seized',
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
          )} at terms ${formattedTermsFromLoan(event.loan)}.`,
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
    subject: 'Loan # is approaching due',
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
          )}, with loan terms ${formattedTermsFromLoan(
            loan,
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
    subject: 'Loan # is past due',
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
          )}, with loan terms ${formattedTermsFromLoan(
            loan,
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
