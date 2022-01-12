import { ethers } from 'ethers';
import { jsonRpcERC721Contract, jsonRpcLoanFacilitator } from 'lib/contracts';
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

const BORROW_CONTRACT = jsonRpcERC721Contract(
  process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
);

const LEND_CONTRACT = jsonRpcERC721Contract(
  process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
);

export async function nodeLoanHistoryById(loanIdString: string) {
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
    const { blockNumber, transactionHash, args } = event as CreateLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;

    const parsedEvent: CreateEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CreateEvent',
      creator: args.minter.toLowerCase(),
      maxPerSecondInterestRate: args.maxInterestRate.toString(),
      minDurationSeconds: args.minDurationSeconds.toString(),
      minLoanAmount: args.minLoanAmount.toString(),
    };
    events.push(parsedEvent);
  }

  for (const event of closeLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as NodeCloseEvent;
    const timestamp = (await event.getBlock()).timestamp;
    const closer = (await event.getTransaction()).from;

    const parsedEvent: CloseEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CloseEvent',
      closer: closer.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  for (const event of underwriteLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as UnderwriteLoanEvent;
    const timestamp = (await event.getBlock()).timestamp;
    const borrowTicketHolder = (
      await BORROW_CONTRACT.ownerOf(args.id)
    ).toLowerCase();

    const parsedEvent: LendEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'LendEvent',
      loanAmount: args.loanAmount.toString(),
      borrowTicketHolder,
      durationSeconds: args.durationSeconds.toString(),
      perSecondInterestRate: args.interestRate.toString(),
      lender: args.underwriter.toLowerCase(),
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
      loanAmount: args.replacedAmount.toString(),
      interestEarned: args.interestEarned.toString(),
      lendTicketOwner: args.replacedLoanOwner.toLowerCase(),
      newLender: args.underwriter.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  for (const event of repayLoanEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as RepayEvent;
    const timestamp = (await event.getBlock()).timestamp;
    const borrowTicketHolder = (
      await BORROW_CONTRACT.ownerOf(args.id)
    ).toLowerCase();
    const lendTicketHolder = (
      await LEND_CONTRACT.ownerOf(args.id)
    ).toLowerCase();

    const parsedEvent: RepaymentEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'RepaymentEvent',
      loanAmount: args.loanAmount.toString(),
      interestEarned: args.interestEarned.toString(),
      borrowTicketHolder,
      lendTicketHolder,
      repayer: args.repayer.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  for (const event of seizeCollateralEvents) {
    const { blockNumber, transactionHash, args } =
      event as unknown as SeizeCollateralEvent;
    const timestamp = (await event.getBlock()).timestamp;
    const tx = await event.getTransaction();
    const borrowTicketHolder = (
      await BORROW_CONTRACT.ownerOf(args.id)
    ).toLowerCase();

    const parsedEvent: CollateralSeizureEvent = {
      blockNumber,
      id: transactionHash,
      timestamp,
      typename: 'CollateralSeizureEvent',
      borrowTicketHolder,
      lendTicketHolder: tx.from.toLowerCase(),
    };
    events.push(parsedEvent);
  }

  const allEvents = events.sort((a, b) => b.blockNumber - a.blockNumber);
  return allEvents;
}
