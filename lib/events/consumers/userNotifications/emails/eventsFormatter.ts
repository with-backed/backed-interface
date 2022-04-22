import { ethers } from 'ethers';

import {
  BuyoutEvent,
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  Loan,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import { parseSubgraphLoan } from 'lib/loans/utils';
import { NotificationTriggerType } from '../shared';
import {
  ensOrAddr,
  formattedDate,
  formattedDuration,
  formattedLoanTerms,
  getEstimatedRepaymentAndMaturity,
} from 'lib/events/consumers/formattingHelpers';
import { siteUrl } from 'lib/chainEnv';
import { captureMessage } from '@sentry/nextjs';

type RenderedTerms = {
  prefix?: string;
  amount: string;
  duration: string;
  interest: string;
};
export type EventsEmailComponents = {
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
  ) => Promise<AddressesToEmailComponentGenerator>;
};

export function getEmailSubject(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
): string {
  const emailMetadata = notificationEventToEmailMetadata[emailTrigger];
  if (!emailMetadata) {
    // fatal bugsnag, invalid email trigger was passed from SNS push
    captureMessage(`Invalid emailTrigger provided: ${emailTrigger}`);
    return '';
  }
  return emailMetadata.getSubjectFromEntity(entity);
}

type AddressesToEmailComponentGenerator = {
  [key: string]: (unsubscribeUuid: string) => EventsEmailComponents;
};

export async function getEmailComponentsMap(
  emailTrigger: NotificationTriggerType,
  entity: RawSubgraphEvent | Loan,
  now: number,
  mostRecentTermsEvent?: LendEvent,
): Promise<AddressesToEmailComponentGenerator | null> {
  const emailMetadata = notificationEventToEmailMetadata[emailTrigger];
  if (!emailMetadata) {
    // fatal bugsnag, invalid email trigger was passed from SNS push
    captureMessage(`Invalid emailTrigger provided: ${emailTrigger}`);
    return null;
  }

  return await emailMetadata.getComponentsFromEntity(
    entity,
    now,
    mostRecentTermsEvent,
  );
}

const emailHeader = (loan: Loan): string =>
  `Loan #${loan.id}: ${loan.collateralName}`;

const notificationEventToEmailMetadata: {
  [key: string]: EmailMetadataType;
} = {
  CreateEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as CreateEvent).loan.id} has been created`,
    getComponentsFromEntity: async (
      entity: RawSubgraphEvent | Loan,
      _now: number,
    ) => {
      const event = entity as CreateEvent;
      const borrower = await ensOrAddr(event.creator);

      const sharedComponents: Partial<EventsEmailComponents> = {
        header: emailHeader(event.loan),
        mainMessage: `${borrower} has created a loan with collateral: ${event.loan.collateralName} #${event.loan.collateralTokenId}.`,
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `Their desired loan terms are:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perAnumInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [],
        viewLinks: [
          `${siteUrl()}/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.creator]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.creator
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
      };
    },
  },

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

      const sharedComponents: Partial<EventsEmailComponents> = {
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
              mostRecentTermsEvent!.perAnumInterestRate,
              mostRecentTermsEvent!.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
          {
            prefix: `The new terms set by ${newLender} are:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perAnumInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}.`,
        ],
        viewLinks: [
          `${siteUrl()}/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.loan.borrowTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            mainMessage: `The loan created by ${borrower} has been bought out with new terms.`,
            footer: `${siteUrl()}/profile/${
              event.loan.borrowTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [event.newLender]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            mainMessage: `${newLender} replaced ${oldLender} as lender.`,
            footer: `${siteUrl()}/profile/${
              event.newLender
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [event.lendTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            mainMessage: `${oldLender} has been replaced as the lender on loan #${event.loan.id}.`,
            footer: `${siteUrl()}/profile/${
              event.lendTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
      };
    },
  },
  LendEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${(entity as LendEvent).loan.id} has a lender`,
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

      const sharedComponents: Partial<EventsEmailComponents> = {
        header: emailHeader(event.loan),
        mainMessage: `The loan created by ${borrower} has been lent to by ${lender}`,
        messageBeforeTerms: [],
        terms: [
          {
            prefix: `${lender} lent at terms:`,
            ...formattedLoanTerms(
              event.loan.loanAmount,
              event.loan.loanAssetDecimal,
              event.loan.perAnumInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `At this rate, repayment of ${repayment} ${event.loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [
          `${siteUrl()}/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.borrowTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.borrowTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [event.lender]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.lender
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
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

      const sharedComponents: Partial<EventsEmailComponents> = {
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
              event.loan.perAnumInterestRate,
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
          `${siteUrl()}/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.repayer]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.repayer
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [event.lendTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.lendTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
      };
    },
  },
  CollateralSeizureEvent: {
    getSubjectFromEntity: (entity: RawSubgraphEvent | Loan) =>
      `Loan #${
        (entity as CollateralSeizureEvent).loan.id
      } collateral has been seized`,
    getComponentsFromEntity: async (entity: RawSubgraphEvent | Loan) => {
      const event = entity as CollateralSeizureEvent;
      const borrower = await ensOrAddr(event.borrowTicketHolder);
      const lender = await ensOrAddr(event.lendTicketHolder);
      const [repayment, _] = getEstimatedRepaymentAndMaturity(
        parseSubgraphLoan(event.loan),
      );

      const sharedComponents: Partial<EventsEmailComponents> = {
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
              event.loan.perAnumInterestRate,
              event.loan.durationSeconds,
              event.loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `The loan became due on ${formattedDate(
            event.loan.endDateTimestamp!,
          )} with a repayment cost of ${repayment} ${
            event.loan.loanAssetSymbol
          }.`,
          `Borrower ${borrower} did not repay, so ${lender} was able to seize the collateral NFT on ${formattedDate(
            event.timestamp,
          )}.`,
        ],
        viewLinks: [
          `${siteUrl()}/loans/${event.loan.id}`,
          `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.id}`,
        ],
      };

      return {
        [event.borrowTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.borrowTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [event.lendTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              event.lendTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
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

      const sharedComponents: Partial<EventsEmailComponents> = {
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
              loan.perAnumInterestRate,
              loan.durationSeconds,
              loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `They accrued ${interestAccruedSoFar} ${loan.loanAssetSymbol} over that period.`,
          `At this rate, repayment of ${repayment} ${loan.loanAssetSymbol} will be due on ${maturity}`,
        ],
        viewLinks: [`${siteUrl()}/loans/${loan.id}`, ''],
        footer: `${siteUrl()}`,
      };

      return {
        [loan.borrowTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              loan.borrowTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [loan.lendTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              loan.lendTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
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

      const sharedComponents: Partial<EventsEmailComponents> = {
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
              loan.perAnumInterestRate,
              loan.durationSeconds,
              loan.loanAssetSymbol,
            ),
          },
        ],
        messageAfterTerms: [
          `They accrued ${formattedInterestAccrued} ${loan.loanAssetSymbol}.`,
          `The loan became due on ${formattedDate(
            loan.endDateTimestamp!,
          )} with a repayment cost of ${repayment} ${loan.loanAssetSymbol}`,
          `Unless borrower ${borrower} repays, ${lender} may seize the collateral NFT.`,
        ],
        viewLinks: [`${siteUrl()}/loans/${loan.id}`, ''],
        footer: `${siteUrl()}`,
      };

      return {
        [loan.borrowTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              loan.borrowTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
        [loan.lendTicketHolder]: (unsubscribeUuid: string) =>
          ({
            ...sharedComponents,
            footer: `${siteUrl()}/profile/${
              loan.lendTicketHolder
            }?unsubscribe=true&uuid=${unsubscribeUuid}`,
          } as EventsEmailComponents),
      };
    },
  },
};
