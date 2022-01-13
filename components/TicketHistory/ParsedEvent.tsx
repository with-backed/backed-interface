import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { ethers } from 'ethers';
import { secondsToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import React, { FunctionComponent, useMemo } from 'react';
import styles from './TicketHistory.module.css';
import { Loan } from 'types/Loan';
import { DescriptionList } from 'components/DescriptionList';
import type * as Event from 'types/Event';

const eventDetailComponents = {
  BuyoutEvent,
  CloseEvent,
  CreateEvent,
  RepaymentEvent,
  CollateralSeizureEvent,
  LendEvent,
};

type ParsedEventProps<T> = {
  event: T;
  loan: Loan;
};
export function ParsedEvent({ event, loan }: ParsedEventProps<Event.Event>) {
  const component = eventDetailComponents[event.typename];

  // I don't love this
  return React.createElement(component as any, { event, loan });
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

type EventHeaderProps = {
  event: Event.Event;
};

function EventHeader({ event }: EventHeaderProps) {
  return (
    <h3 className={styles['event-header']}>
      <EtherscanTransactionLink transactionHash={event.id.toString()}>
        {camelToSentenceCase(event.typename as string)}
      </EtherscanTransactionLink>
    </h3>
  );
}

const EventDetailList: FunctionComponent<EventHeaderProps> = ({
  children,
  event,
  ...props
}) => {
  return (
    <section>
      <EventHeader event={event} />
      <DescriptionList {...props}>
        <dt>date</dt>
        <dd>{toLocaleDateTime(event.timestamp)}</dd>
        {children}
      </DescriptionList>
    </section>
  );
};

function CreateEvent({
  event,
  loan: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<Event.CreateEvent>) {
  const { maxInterestRate, minLoanAmount, minDurationSeconds, minter } = event;
  const formattedMaxInterestRate = useMemo(
    () => formattedAnnualRate(ethers.BigNumber.from(maxInterestRate)),
    [maxInterestRate],
  );

  const formattedMinLoanAmount = useMemo(
    () => ethers.utils.formatUnits(minLoanAmount, loanAssetDecimals),
    [minLoanAmount, loanAssetDecimals],
  );

  const minDuration = useMemo(
    () => secondsToDays(ethers.BigNumber.from(minDurationSeconds).toNumber()),
    [minDurationSeconds],
  );

  return (
    <EventDetailList event={event}>
      <dt>minter</dt>
      <dd>{minter.slice(0, 10)}...</dd>
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

function LendEvent({
  event,
  loan: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<Event.LendEvent>) {
  const { durationSeconds, interestRate, loanAmount, underwriter } = event;

  const formattedInterestRate = useMemo(
    () => formattedAnnualRate(ethers.BigNumber.from(interestRate)),
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
      <dt>underwriter</dt>
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

function BuyoutEvent({
  event,
  loan: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<Event.BuyoutEvent>) {
  const { interestEarned, replacedAmount, replacedLoanOwner, underwriter } =
    event;

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
      <dt>new underwriter</dt>
      <dd>{underwriter.slice(0, 10)}...</dd>
      <dt>bought-out underwriter</dt>
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

function RepaymentEvent({
  event,
  loan: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps<Event.RepaymentEvent>) {
  const { interestEarned, loanAmount, loanOwner, repayer } = event;

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
      <dt>RepaymentEventer</dt>
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

function CollateralSeizureEvent({
  event,
}: ParsedEventProps<Event.CollateralSeizureEvent>) {
  return <EventDetailList event={event} />;
}

function CloseEvent({ event }: ParsedEventProps<Event.CloseEvent>) {
  return <EventDetailList event={event} />;
}
