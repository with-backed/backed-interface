import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ethers } from 'ethers';

import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import { formattedAnnualRate } from 'lib/interest';
import { SCALAR } from 'lib/constants';
import { getMostRecentTermsForLoan } from 'lib/loans/subgraph/subgraphLoans';
import { Loan as ParsedLoan } from 'types/Loan';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { NotificationTriggerType } from './shared';
import { addressToENS } from 'lib/account';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type RenderedTerms = {
  prefix?: string;
  amount: string;
  duration: string;
  interest: string;
};
export type EmailComponents = {
  header: string;
  mainMessage: string;
  messageBeforeTerms: string[];
  terms: RenderedTerms[];
  messageAfterTerms: string[];
  viewLinks: [string, string];
  footer: string;
};

type EmailMetadataType = {
  getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) => string;
  getComponentsFromEntity: (
    entity: RawSubgraphEvent | Loan,
    now: number,
    mostRecentTermsEvent?: LendEvent,
  ) => Promise<AddressesToEmailComponent>;
};

const ensOrAddr = async (rawAddress: string): Promise<string> => {
  const ens = await addressToENS(rawAddress);
  if (ens === null) {
    return rawAddress.substring(0, 7);
  }
  return ens;
};

const emailHeader = (loan: Loan): string =>
  `Loan #${loan.id}: ${loan.collateralName}`;

const formattedLoanTerms = (
  loanAmount: number,
  loanAssetDecimal: number,
  perSecondInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
) => {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perSecondInterestRate),
  );

  return {
    amount,
    duration: formattedDuration(durationSeconds),
    interest: `${interest}%`,
  };
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

type AddressesToEmailComponent = {
  [key: string]: EmailComponents;
};

export async function getEmailComponentsMap(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
  mostRecentTermsEvent?: LendEvent,
): Promise<AddressesToEmailComponent | null> {
  const emailMetadata = notificationEventToEmailMetadata[emailTrigger];
  if (!emailMetadata) {
    // fatal bugsnag, invalid email trigger was passed from SNS push
    return null;
  }

  return await emailMetadata.getComponentsFromEntity(
    entity,
    now,
    mostRecentTermsEvent,
  );
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
      mostRecentTermsEvent?: LendEvent,
    ) => {
      const event = entity as BuyoutEvent;
      const borrower = await ensOrAddr(event.loan.borrowTicketHolder);
      const oldLender = await ensOrAddr(event.lendTicketHolder);
      const newLender = await ensOrAddr(event.newLender);
      const formattedInterestEarned = ethers.utils.formatUnits(
        event.interestEarned,
        event.loan.loanAssetDecimal,
      );

      const [repayment, maturity] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(event.loan),
      );

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(event.loan),
        messageBeforeTerms: [
          `${oldLender} held the loan for ${formattedDuration(
            event.timestamp - mostRecentTermsEvent!.timestamp,
          )} and accrued ${formattedInterestEarned} ${
            event.loan.loanAssetSymbol
          } in interest over that period.`,
        ],
        terms: [
          {
            prefix: 'Their loan terms were:',
            ...formattedLoanTerms(
              mostRecentTermsEvent!.loanAmount,
              event.loan.loanAssetDecimal,
              mostRecentTermsEvent!.perSecondInterestRate,
              mostRecentTermsEvent!.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
          {
            prefix: `The new terms set by ${newLender} are:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perSecondInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}.`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.loan.borrowTicketHolder]: {
          ...sharedComponents,
          mainMessage: `The loan created by ${borrower} has been bought out with new terms.`,
          footer: `https://nftpawnshop.xyz/profile/${event.loan.borrowTicketHolder}`,
        } as EmailComponents,
        [event.newLender]: {
          ...sharedComponents,
          mainMessage: `${newLender} replaced ${oldLender} as lender.`,
          footer: `https://nftpawnshop.xyz/profile/${event.newLender}`,
        } as EmailComponents,
        [event.lendTicketHolder]: {
          ...sharedComponents,
          mainMessage: `${oldLender} has been replaced as the lender on loan #${event.loan.id}.`,
          footer: `https://nftpawnshop.xyz/profile/${event.lendTicketHolder}`,
        } as EmailComponents,
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

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(event.loan),
        mainMessage: `The loan created by ${borrower} has been lent to by ${lender}`,
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} lent at terms:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perSecondInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.borrowTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.borrowTicketHolder}`,
        } as EmailComponents,
        [event.lender]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.lender}`,
        } as EmailComponents,
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

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(event.loan),
        mainMessage: `${repayer} repaid the loan`,
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} held the loan for ${formattedDuration(
              event.timestamp - event.loan.createdAtTimestamp,
            )}, with loan terms:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perSecondInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `They accrued ${formattedInterestEarned} ${event.loan.loanAssetSymbol} over that period.`,
          `The total cost to repay was ${formattedTotalRepay} ${event.loan.loanAssetSymbol}.`,
        ],
        viewLinks: [
          `https://nftpawnshop.xyz/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.repayer]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.repayer}`,
        } as EmailComponents,
        [event.lendTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.lendTicketHolder}`,
        } as EmailComponents,
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

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(event.loan),
        mainMessage: `Lender ${lender} has seized the collateral NFT on Loan #${event.loan.id}`,
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} held the loan for ${formattedDuration(
              event.timestamp - event.loan.createdAtTimestamp,
            )} at terms:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perSecondInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
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

      return {
        [event.borrowTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.borrowTicketHolder}`,
        } as EmailComponents,
        [event.lendTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${event.lendTicketHolder}`,
        } as EmailComponents,
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

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(loan),
        mainMessage: 'This loan will be due in 24 hours',
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} held the loan for ${formattedDuration(
              loanDuration,
            )}, with loan terms:`,
            ...formattedLoanTerms(
              loan.loanAmount,
              loan.loanAssetDecimal,
              loan.perSecondInterestRate,
              loan.durationSeconds,
              loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `They accrued ${interestAccruedSoFar} ${loan.loanAssetSymbol} over that period.`,
          `At this rate, repayment of ${repayment} ${loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [`https://nftpawnshop.xyz/loans/${loan.id}`, ''],
        footer: `https://nftpawnshop.xyz`,
      };

      return {
        [loan.borrowTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${loan.borrowTicketHolder}`,
        } as EmailComponents,
        [loan.lendTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${loan.lendTicketHolder}`,
        } as EmailComponents,
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

      const sharedComponents: Partial<EmailComponents> = {
        header: emailHeader(loan),
        mainMessage:
          'The loan is past due, and its NFT collateral may be seized.',
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} held the loan for ${formattedDuration(
              loanDuration,
            )}, with loan terms:`,
            ...formattedLoanTerms(
              loan.loanAmount,
              loan.loanAssetDecimal,
              loan.perSecondInterestRate,
              loan.durationSeconds,
              loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `They accrued ${formattedInterestAccrued} ${loan.loanAssetSymbol}.`,
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

      return {
        [loan.borrowTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${loan.borrowTicketHolder}`,
        } as EmailComponents,
        [loan.lendTicketHolder]: {
          ...sharedComponents,
          footer: `https://nftpawnshop.xyz/profile/${loan.lendTicketHolder}`,
        } as EmailComponents,
      };
    },
  },
};
