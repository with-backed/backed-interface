import { EtherscanAddressLink } from 'components/EtherscanLink';
import { ethers } from 'ethers';
import { secondsToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { LoanInfo } from 'lib/LoanInfoType';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './TicketHistory.module.css';

const eventDetailComponents = {
  CreateLoan: CreateLoanEvent,
  UnderwriteLoan: UnderwriteLoanEvent,
  BuyoutUnderwriter: BuyoutUnderwriterEvent,
  Repay: RepayLoanEvent,
};

type ParsedEventProps = {
  event: ethers.Event;
  loanInfo: LoanInfo;
}
export function ParsedEvent({ event, loanInfo }: ParsedEventProps) {
  const component = eventDetailComponents[event.event];
  if (component) {
    return React.createElement(component, { event, loanInfo });
  }
  console.warn(new Error(`received unhandled event type: ${event.event}`));
  return null;
}

function toLocaleDateTime(seconds: number) {
  var date = new Date(0);
  date.setUTCSeconds(seconds);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

function camelToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function EventHeader({ event }: Pick<ParsedEventProps, "event">) {
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const getTimestamp = useCallback(async () => {
    const { timestamp } = await event.getBlock();
    setTimestamp(toLocaleDateTime(timestamp));
  }, [event]);

  useEffect(() => {
    getTimestamp();
  }, [getTimestamp]);
  return (
    <h3 className={styles['event-header']}>
      <a
        href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${event.transactionHash}`}
        target="_blank"
        rel="noreferrer"
      >
        <b>{camelToSentenceCase(event.event)}</b> {timestamp}
      </a>
    </h3>
  )
}

const EventDetailList: FunctionComponent<Pick<ParsedEventProps, "event">> = ({
  children,
  event,
  ...props
}) => {
  return (
    <li>
      <section className={styles.section}>
        <EventHeader event={event} />
        <ul {...props} className={styles.list}>{children}</ul>
      </section>
    </li>
  );
}

function CreateLoanEvent({ event, loanInfo: { loanAssetDecimals } }: ParsedEventProps) {
  const { maxInterestRate, minDurationSeconds, minLoanAmount, minter } = event.args;

  const minterLink = useMemo(() => (
    <EtherscanAddressLink address={minter}>
      {minter?.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [minter]);

  const formattedMaxInterestRate = useMemo(() => (
    formattedAnnualRate(maxInterestRate)
  ), [maxInterestRate]);

  const formattedMinLoanAmount = useMemo(() => (
    ethers.utils.formatUnits(minLoanAmount, loanAssetDecimals)
  ), [minLoanAmount, loanAssetDecimals]);

  const minDuration = useMemo(() => (
    secondsToDays(minDurationSeconds)
  ), [minDurationSeconds]);

  return (
    <EventDetailList event={event}>
      <li>minter: {minterLink}</li>
      <li>max interest rate: {formattedMaxInterestRate}</li>
      <li>minimum loan amount: {formattedMinLoanAmount}</li>
      <li>minimum duration: {minDuration}</li>
    </EventDetailList>
  );
};

function UnderwriteLoanEvent({ event, loanInfo: { loanAssetDecimals } }: ParsedEventProps) {
  const { durationSeconds, interestRate, loanAmount, underwriter } = event.args;

  const underwriterLink = useMemo(() => (
    <EtherscanAddressLink address={underwriter}>
      {underwriter?.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [underwriter]);

  const formattedInterestRate = useMemo(() => formattedAnnualRate(interestRate), [interestRate]);
  const formattedLoanAmount = useMemo(() => (
    ethers.utils.formatUnits(loanAmount, loanAssetDecimals)
  ), [loanAmount, loanAssetDecimals]);
  const formattedDuration = useMemo(() => (
    secondsToDays(durationSeconds)
  ), [durationSeconds]);

  return (
    <EventDetailList event={event}>
      <li>lender: {underwriterLink}</li>
      <li>interest rate: {formattedInterestRate}</li>
      <li>loan amount: {formattedLoanAmount}</li>
      <li>duration: {formattedDuration}</li>
    </EventDetailList>
  );
}

function BuyoutUnderwriterEvent({ event, loanInfo: { loanAssetDecimals } }: ParsedEventProps) {
  const { interestEarned, replacedAmount, replacedLoanOwner, underwriter } = event.args;

  const newLenderLink = useMemo(() => (
    <EtherscanAddressLink address={underwriter}>
      {underwriter.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [underwriter]);

  const replacedLenderLink = useMemo(() => (
    <EtherscanAddressLink address={replacedLoanOwner}>
      {replacedLoanOwner.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [replacedLoanOwner]);

  const formattedInterestPaid = useMemo(() => (
    ethers.utils.formatUnits(interestEarned, loanAssetDecimals)
  ), [interestEarned, loanAssetDecimals]);

  const formattedLoanAmount = useMemo(() => (
    ethers.utils.formatUnits(replacedAmount, loanAssetDecimals)
  ), [replacedAmount, loanAssetDecimals]);

  return (
    <EventDetailList event={event}>
      <li>new lender: {newLenderLink}</li>
      <li>bought-out lender: {replacedLenderLink}</li>
      <li>interest paid: {formattedInterestPaid}</li>
      <li>loan amount: {formattedLoanAmount}</li>
    </EventDetailList>
  )
}

function RepayLoanEvent({ event, loanInfo: { loanAssetDecimals } }: ParsedEventProps) {
  const { interestEarned, loanAmount, loanOwner, repayer } = event.args;

  const repayerLink = useMemo(() => (
    <EtherscanAddressLink address={repayer}>
      {repayer.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [repayer]);

  const loanOwnerLink = useMemo(() => (
    <EtherscanAddressLink address={loanOwner}>
      {loanOwner.slice(0, 10)}...
    </EtherscanAddressLink>
  ), [loanOwner]);

  const formattedInterestEarned = useMemo(() => (
    ethers.utils.formatUnits(interestEarned, loanAssetDecimals)
  ), [interestEarned, loanAssetDecimals]);

  const formattedLoanAmount = useMemo(() => (
    ethers.utils.formatUnits(loanAmount, loanAssetDecimals)
  ), [loanAmount, loanAssetDecimals]);

  return (
    <EventDetailList event={event}>
      <li>repayer: {repayerLink}</li>
      <li>paid to: {loanOwnerLink}</li>
      <li>interest earned: {formattedInterestEarned}</li>
      <li>loan amount: {formattedLoanAmount}</li>
    </EventDetailList>
  )
}
