import { ethers } from 'ethers';
import { CreateLoanEvent as TypeChainCreateLoanEvent } from 'abis/types/NFTLoanFacilitator';
import { CreateLoanEvent } from 'lib/types/LoanEvents/CreateLoanEvent';
import { SubgraphCreateEvent } from 'lib/types/SubgraphLoanEvents/SubgraphCreateEvent';
import { timestampFromEvent } from 'lib/timestampFromEvent';

export function createLoanEventFromSubgraphCreateEvent(
  loan: SubgraphCreateEvent,
): CreateLoanEvent {
  return {
    kind: 'create',
    timestamp: loan.timestamp,
    creator: loan.creator,
    transactionHash: loan.id,
    minLoanAmount: ethers.BigNumber.from(loan.minLoanAmount),
    maxPerSecondInterestRate: ethers.BigNumber.from(
      loan.maxPerSecondInterestRate,
    ),
    minDurationSeconds: ethers.BigNumber.from(loan.minDurationSeconds),
  };
}

export async function createLoanEventFromTypeChainCreateLoanEvent(
  loan: TypeChainCreateLoanEvent,
): Promise<CreateLoanEvent> {
  const timestamp = await timestampFromEvent(loan);
  return {
    kind: 'create',
    timestamp: timestamp,
    creator: loan.args.minter,
    transactionHash: loan.transactionHash,
    minLoanAmount: loan.args.minLoanAmount,
    maxPerSecondInterestRate: loan.args.maxInterestRate,
    minDurationSeconds: loan.args.minDurationSeconds,
  };
}
