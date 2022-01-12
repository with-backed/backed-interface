import { ethers } from 'ethers';
import { jsonRpcLoanFacilitator } from 'lib/contracts';
import {
  BuyoutEvent,
  CloseEvent,
  CreateEvent,
  Event,
  LendEvent,
  CollateralSeizureEvent,
} from 'types/Event';
import {
  CreateLoanEvent,
  CloseEvent as NodeCloseEvent,
  UnderwriteLoanEvent,
  BuyoutUnderwriterEvent,
  RepayEvent,
  SeizeCollateralEvent,
} from 'types/generated/abis/NFTLoanFacilitator';

export async function nodeLoanHistoryById(loanId: ethers.BigNumberish) {
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

  const events: Event[] = [];

  createLoanEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } = event as CreateLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CreateEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CreateEvent',
      creator: args.minter,
      maxPerSecondInterestRate: args.maxInterestRate,
      minDurationSeconds: args.minDurationSeconds,
      minLoanAmount: args.minLoanAmount,
    };
    events.push(parsedEvent);
  });

  closeLoanEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } =
      event as unknown as NodeCloseEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CloseEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CloseEvent',
      // wrong
      closer: args.id,
    };
    events.push(parsedEvent);
  });

  underwriteLoanEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } =
      event as unknown as UnderwriteLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: LendEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'LendEvent',
      loanAmount: args.loanAmount,
      // wrong
      borrowTicketHolder: args.id,
      durationSeconds: args.durationSeconds,
      perSecondInterestRate: args.interestRate,
      lender: args.underwriter,
    };
    events.push(parsedEvent);
  });

  buyoutUnderwriterEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } =
      event as unknown as BuyoutUnderwriterEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: BuyoutEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'BuyoutEvent',
      loanAmount: args.replacedAmount,
      interestEarned: args.interestEarned,
      lendTicketOwner: args.underwriter,
      newLender: args.underwriter,
    };
    events.push(parsedEvent);
  });

  repayLoanEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } =
      event as unknown as RepayEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: BuyoutEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'BuyoutEvent',
      loanAmount: args.loanAmount,
      interestEarned: args.interestEarned,
      lendTicketOwner: args.loanOwner,
      newLender: args.repayer,
    };
    events.push(parsedEvent);
  });

  seizeCollateralEvents.forEach(async (event) => {
    const { blockNumber, transactionHash, args } =
      event as unknown as SeizeCollateralEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CollateralSeizureEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CollateralSeizureEvent',
      // wrong
      borrowTicketHolder: args.id,
      // wrong
      lendTicketHolder: args.id,
    };
    events.push(parsedEvent);
  });

  const allEvents = events.sort((a, b) => b.blockNumber - a.blockNumber);
  return allEvents;
}
