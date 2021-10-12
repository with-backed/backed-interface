import { ethers } from 'ethers';
import NFTPawnShopArtifact from '../contracts/NFTPawnShop.json';
import ERC20Artifact from '../contracts/ERC20.json';
import ERC721Artifact from '../contracts/ERC721.json';
import { TicketInfo } from './TicketInfoType';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

const pawnShopContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT,
  NFTPawnShopArtifact.abi,
  _provider,
);

const pawnLoansContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_PAWN_LOANS_CONTRACT,
  ERC721Artifact.abi,
  _provider,
);

const pawnTicketsContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_PAWN_TICKETS_CONTRACT,
  ERC721Artifact.abi,
  _provider,
);

export async function getAllTicketIds() {
  const numberOfTickets = await pawnShopContract.totalSupply();

  const ticketsArray = (numberOfTickets): string[] => {
    const a: Array<string> = [];
    for (let i = 1; i <= numberOfTickets; i++) {
      a.push(i.toString());
    }
    return a;
  };

  return ticketsArray(numberOfTickets).map((ticket) => ({
    params: {
      id: ticket,
    },
  }));
}

export async function getTicketInfo(id: string): Promise<TicketInfo> {
  const ticketInfo = await pawnShopContract.ticketInfo(
    ethers.BigNumber.from(id),
  );
  const { loanAsset } = ticketInfo;
  const { collateralAddress } = ticketInfo;
  const { collateralID } = ticketInfo;
  const { perSecondInterestRate } = ticketInfo;
  const { accumulatedInterest } = ticketInfo;
  const { lastAccumulatedTimestamp } = ticketInfo;
  const { durationSeconds } = ticketInfo;
  const { loanAmount } = ticketInfo;
  const { collateralSeized } = ticketInfo;
  const { closed } = ticketInfo;

  const assetContract = new ethers.Contract(
    loanAsset,
    ERC20Artifact.abi,
    _provider,
  );

  const decimals = await assetContract.decimals();
  const loanAssetSymbol = await assetContract.symbol();
  let loanOwner = null;
  if (lastAccumulatedTimestamp != 0) {
    loanOwner = await pawnLoansContract.ownerOf(BigInt(id));
  }

  const interestOwed = await pawnShopContract.interestOwed(BigInt(id));
  const ticketOwner = await pawnTicketsContract.ownerOf(BigInt(id));

  return {
    ticketNumber: id,
    loanAsset,
    collateralAddress,
    collateralID,
    perSecondInterestRate,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    durationSeconds,
    loanAmount,
    closed,
    collateralSeized,
    loanAssetDecimals: parseInt(decimals.toString()),
    loanAssetSymbol,
    loanOwner,
    ticketOwner,
    interestOwed,
  };
}
