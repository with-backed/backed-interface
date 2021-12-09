import React from 'react';

import { ParsedEvent } from 'components/ticketPage/TicketHistory/ParsedEvent';
import { ethers } from 'ethers';
import { LoanInfo } from 'lib/LoanInfoType';
import {
  BuyoutUnderwriterEvent,
  CloseEvent,
  CreateLoanEvent,
  OwnershipTransferredEvent,
  RepayEvent,
  SeizeCollateralEvent,
  UnderwriteLoanEvent,
} from 'abis/types/NFTLoanFacilitator';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';

export default {
  title: 'Components/ticketPage/TicketHistory/ParsedEvent',
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

const loanInfo: LoanInfo = {
  loanId: ethers.BigNumber.from(1),
  loanAssetContractAddress: '0x123abc',
  collateralContractAddress: '0xdef999',
  collateralTokenId,
  perSecondInterestRate: ethers.BigNumber.from(6),
  accumulatedInterest: ethers.BigNumber.from(7700),
  lastAccumulatedTimestamp: ethers.BigNumber.from(66),
  durationSeconds: ethers.BigNumber.from(9001),
  loanAmount: ethers.BigNumber.from(650),
  closed: false,
  loanAssetDecimals: 2,
  loanAssetSymbol: ':D',
  lender: '0xbadc0ffee',
  borrower: '0xdeadbeef',
  interestOwed: ethers.BigNumber.from(0),
};
const events: ethers.Event[] = [
  {
    event: 'Close',
    args: { id },
    getBlock,
  } as CloseEvent,
  {
    event: 'Repay',
    args: {
      repayer: loanInfo.borrower,
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
          <ParsedEvent key={i} event={e} loanInfo={loanInfo} />
        ))}
      </Fieldset>
    </ThreeColumn>
  );
};
