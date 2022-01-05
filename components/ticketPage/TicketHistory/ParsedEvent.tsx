import {
  EtherscanAddressLink,
  EtherscanTransactionLink,
} from 'components/EtherscanLink';
import { ethers } from 'ethers';
import { secondsToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import React, { FunctionComponent, useMemo } from 'react';
import {
  BuyoutUnderwriterEvent,
  CloseEvent,
  CreateLoanEvent,
  OwnershipTransferredEvent,
  RepayEvent,
  SeizeCollateralEvent,
  UnderwriteLoanEvent,
} from 'abis/types/NFTLoanFacilitator';
import styles from './TicketHistory.module.css';
import { Loan } from 'lib/types/Loan';
import { DescriptionList } from 'components/DescriptionList';

const eventDetailComponents: { [key: string]: (...props: any) => JSX.Element } =
  {
    BuyoutUnderwriter,
    Close,
    CreateLoan,
    OwnershipTransferred,
    Repay,
    SeizeCollateral,
    UnderwriteLoan,
  };

type ParsedEventProps<T> = {
  event: T;
  loanInfo: Loan;
};
export function ParsedEvent({
  event,
  loanInfo,
}: ParsedEventProps<ethers.Event>) {
  const component =
    // keeping typescript happy and having some measure of runtime safety
    eventDetailComponents[event.event || '__INTERNAL_DID_NOT_RECEIVE_EVENT'];
  if (component) {
    return React.createElement(component, { event, loanInfo });
  }
  console.warn(new Error(`received unhandled event type: ${event.event}`));
  return null;
}

function toLocaleDateTime(seconds: number) {
  var date = new Date(0);
  date.setUTCSeconds(seconds);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function camelToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function EventHeader({ event }: Pick<ParsedEventProps<ethers.Event>, 'event'>) {
  return (
    <h3 className={styles['event-header']}>
      <EtherscanTransactionLink transactionHash={event.transactionHash}>
        {camelToSentenceCase(event.event as string)}
      </EtherscanTransactionLink>
    </h3>
  );
}

const EventDetailList: FunctionComponent<
  Pick<ParsedEventProps<ethers.Event>, 'event'>
> = ({ children, event, ...props }) => {
  return (
    <section>
      <EventHeader event={event} />
      <DescriptionList {...props}>{children}</DescriptionList>
    </section>
  );
};

function CreateLoan({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<CreateLoanEvent>) {
  const { maxInterestRate, minDurationSeconds, minLoanAmount, minter } =
    event.args;

  const formattedMaxInterestRate = useMemo(
    () => formattedAnnualRate(maxInterestRate),
    [maxInterestRate],
  );

  const formattedMinLoanAmount = useMemo(
    () => ethers.utils.formatUnits(minLoanAmount, loanAssetDecimals),
    [minLoanAmount, loanAssetDecimals],
  );

  const minDuration = useMemo(
    () => secondsToDays(minDurationSeconds.toNumber()),
    [minDurationSeconds],
  );

  return (
    <EventDetailList event={event}>
      <dt>minter</dt>
      <dd>{minter?.slice(0, 10)}...</dd>
      <dt>max interest rate</dt>
      <dd>{formattedMaxInterestRate}%</dd>
      <dt>minimum loan amount</dt>
      <dd>
        {formattedMinLoanAmount} {loanAssetSymbol}
      </dd>
      <dt>minimum duration</dt>
      <dd>{minDuration} days</dd>
    </EventDetailList>
  );
}

function UnderwriteLoan({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<UnderwriteLoanEvent>) {
  const { durationSeconds, interestRate, loanAmount, underwriter } = event.args;

  const formattedInterestRate = useMemo(
    () => formattedAnnualRate(interestRate),
    [interestRate],
  );
  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
    [loanAmount, loanAssetDecimals],
  );
  const formattedDuration = useMemo(
    () => secondsToDays(durationSeconds.toNumber()),
    [durationSeconds],
  );

  return (
    <EventDetailList event={event}>
      <dt>lender</dt>
      <dd> {underwriter?.slice(0, 10)}...</dd>
      <dt>interest rate</dt>
      <dd>{formattedInterestRate}%</dd>
      <dt>loan amount</dt>
      <dd>
        {formattedLoanAmount} {loanAssetSymbol}
      </dd>
      <dt>duration</dt>
      <dd>{formattedDuration} days</dd>
    </EventDetailList>
  );
}

function BuyoutUnderwriter({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<BuyoutUnderwriterEvent>) {
  const { interestEarned, replacedAmount, replacedLoanOwner, underwriter } =
    event.args;

  const formattedInterestPaid = useMemo(
    () => ethers.utils.formatUnits(interestEarned, loanAssetDecimals),
    [interestEarned, loanAssetDecimals],
  );

  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(replacedAmount, loanAssetDecimals),
    [replacedAmount, loanAssetDecimals],
  );

  return (
    <EventDetailList event={event}>
      <dt>new lender</dt>
      <dd>{underwriter.slice(0, 10)}...</dd>
      <dt>bought-out lender</dt>
      <dd>{replacedLoanOwner.slice(0, 10)}...</dd>
      <dt>interest paid</dt>
      <dd>
        {formattedInterestPaid} {loanAssetSymbol}
      </dd>
      <dt>loan amount</dt>
      <dd>
        {formattedLoanAmount} {loanAssetSymbol}
      </dd>
    </EventDetailList>
  );
}

function Repay({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<RepayEvent>) {
  const { interestEarned, loanAmount, loanOwner, repayer } = event.args as any;

  const formattedInterestEarned = useMemo(
    () => ethers.utils.formatUnits(interestEarned, loanAssetDecimals),
    [interestEarned, loanAssetDecimals],
  );

  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
    [loanAmount, loanAssetDecimals],
  );

  return (
    <EventDetailList event={event}>
      <dt>repayer</dt>
      <dd>{repayer.slice(0, 10)}...</dd>
      <dt>paid to</dt>
      <dd>{loanOwner.slice(0, 10)}...</dd>
      <dt>interest earned</dt>
      <dd>
        {formattedInterestEarned} {loanAssetSymbol}
      </dd>
      <dt>loan amount</dt>
      <dd>
        {formattedLoanAmount} {loanAssetSymbol}
      </dd>
    </EventDetailList>
  );
}

function SeizeCollateral({ event }: ParsedEventProps<SeizeCollateralEvent>) {
  return <EventDetailList event={event} />;
}

function Close({ event }: ParsedEventProps<CloseEvent>) {
  return <EventDetailList event={event} />;
}

function OwnershipTransferred({
  event,
}: ParsedEventProps<OwnershipTransferredEvent>) {
  const { newOwner, previousOwner } = event.args;

  return (
    <EventDetailList event={event}>
      <dt>new owner</dt>
      <dd>{newOwner.slice(0, 10)}...</dd>
      <dt>previous owner</dt>
      <dd>{previousOwner.slice(0, 10)}...</dd>
    </EventDetailList>
  );
}
