import { ethers } from 'ethers';
import { jsonRpcLoanFacilitator } from 'lib/contracts';
import {
  BuyoutEvent,
  CloseEvent,
  CreateEvent,
  Event,
  LendEvent,
  CollateralSeizureEvent,
  RepaymentEvent,
} from 'types/Event';
import {
  CreateLoanEvent,
  CloseEvent as NodeCloseEvent,
  UnderwriteLoanEvent,
  BuyoutUnderwriterEvent,
  RepayEvent,
  SeizeCollateralEvent,
} from 'types/generated/abis/NFTLoanFacilitator';

export async function nodeLoanEventsById(loanIdString: string) {
  const loanId = ethers.BigNumber.from(loanIdString);
  const contract = jsonRpcLoanFacilitator();

  const createLoanFilter = contract.filters.CreateLoan(loanId, null);
  const closeFilter = contract.filters.Close(loanId);
  const underwriteLoanFilter = contract.filters.UnderwriteLoan(loanId);
  const buyoutUnderwriterFilter = contract.filters.BuyoutUnderwriter(loanId);
  const repayLoanFilter = contract.filters.Repay(loanId);
  const seizeCollateralFilter = contract.filters.SeizeCollateral(loanId);

  const filters = [
    createLoanFilter,
    closeFilter,
    underwriteLoanFilter,
    buyoutUnderwriterFilter,
    repayLoanFilter,
    seizeCollateralFilter,
  ];

  const [
    createLoanEvents,
    closeLoanEvents,
    underwriteLoanEvents,
    buyoutUnderwriterEvents,
    repayLoanEvents,
    seizeCollateralEvents,
  ] = await Promise.all(
    filters.map((filter) => {
      return contract.queryFilter(
        filter,
        parseInt(process.env.NEXT_PUBLIC_FACILITATOR_START_BLOCK || ''),
      );
    }),
  );

  let events: Event[] = [];

  for (const event of createLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as CreateLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CreateEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CreateEvent',
      minter: args.minter.toLowerCase(),
      maxInterestRate: args.maxInterestRate,
      minDurationSeconds: args.minDurationSeconds,
      minLoanAmount: args.minLoanAmount,
    };
    events.push(parsedEvent);
  }

  for (const event of closeLoanEvents) {
    const { blockNumber, transactionHash } = event as unknown as NodeCloseEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CloseEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CloseEvent',
    };
    events.push(parsedEvent);
  }

  for (const event of underwriteLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as UnderwriteLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: LendEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'LendEvent',
      loanAmount: args.loanAmount,
      durationSeconds: args.durationSeconds,
      interestRate: args.interestRate,
      underwriter: args.underwriter.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  for (const event of buyoutUnderwriterEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as BuyoutUnderwriterEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: BuyoutEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'BuyoutEvent',
      replacedAmount: args.replacedAmount,
      interestEarned: args.interestEarned,
      replacedLoanOwner: args.replacedLoanOwner.toLowerCase(),
      underwriter: args.underwriter.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  for (const event of repayLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as RepayEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: RepaymentEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'RepaymentEvent',
      loanAmount: args.loanAmount,
      interestEarned: args.interestEarned,
      repayer: args.repayer.toLowerCase(),
      loanOwner: args.loanOwner,
    };
    events.push(parsedEvent);
  }

  for (const event of seizeCollateralEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as SeizeCollateralEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CollateralSeizureEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CollateralSeizureEvent',
    };
    events.push(parsedEvent);
  }

  const allEvents = events.sort((a, b) => b.blockNumber - a.blockNumber);
  return allEvents;
}
