import React from 'react';

import { ParsedEvent } from 'components/TicketHistory/ParsedEvent';
import { ethers } from 'ethers';
import {
  BuyoutUnderwriterEvent,
  CloseEvent,
  CreateLoanEvent,
  OwnershipTransferredEvent,
  RepayEvent,
  SeizeCollateralEvent,
  UnderwriteLoanEvent,
} from 'types/generated/abis/NFTLoanFacilitator';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { baseLoan } from 'lib/mockData';

export default {
  title: 'Components/TicketHistory/ParsedEvent',
  component: ParsedEvent,
};

const id = ethers.BigNumber.from(1);
const minter = '0xminter';
const collateralTokenId = ethers.BigNumber.from(1);
const collateralContract = '0xdef999';
const maxInterestRate = ethers.BigNumber.from(9001);
const loanAssetContract = '0x123abc';
const minLoanAmount = ethers.BigNumber.from(10);
const minDurationSeconds = ethers.BigNumber.from(660);
const underwriter = '0xunderwriter';
const interestEarned = ethers.BigNumber.from(0);
const replacedAmount = ethers.BigNumber.from(0);
const getBlock = async (): Promise<ethers.providers.Block> =>
  ({ timestamp: 1999999999 } as any);

const loan = baseLoan;

const events: ethers.Event[] = [
  {
    event: 'Close',
    args: { id },
    getBlock,
  } as CloseEvent,
  {
    event: 'Repay',
    args: {
      repayer: loan.borrower,
      loanOwner: underwriter,
      interestEarned,
      loanAmount: minLoanAmount,
    },
    getBlock,
  } as RepayEvent,
  {
    event: 'SeizeCollateral',
    args: { id },
    getBlock,
  } as SeizeCollateralEvent,
  {
    event: 'OwnershipTransferred',
    args: {
      newOwner: underwriter,
      previousOwner: underwriter,
    },
    getBlock,
  } as OwnershipTransferredEvent,
  {
    event: 'BuyoutUnderwriter',
    args: {
      id,
      underwriter,
      replacedLoanOwner: underwriter,
      interestEarned,
      replacedAmount,
    },
    getBlock,
  } as BuyoutUnderwriterEvent,
  {
    event: 'UnderwriteLoan',
    args: {
      id,
      underwriter,
      interestRate: maxInterestRate,
      loanAmount: minLoanAmount,
      durationSeconds: minDurationSeconds,
    },
    getBlock,
  } as UnderwriteLoanEvent,
  {
    event: 'CreateLoan',
    args: {
      id,
      minter,
      collateralTokenId,
      collateralContract,
      maxInterestRate,
      loanAssetContract,
      minLoanAmount,
      minDurationSeconds,
    },
    getBlock,
  } as CreateLoanEvent,
];

export const ParsedEvents = () => {
  return (
    <ThreeColumn>
      <Fieldset legend="loan history">
        {events.map((e, i) => (
          <ParsedEvent key={i} event={e} loan={loan} />
        ))}
      </Fieldset>
    </ThreeColumn>
  );
};
