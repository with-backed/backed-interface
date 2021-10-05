import { ethers } from "ethers";
import NFTPawnShopArtifact from "../contracts/NFTPawnShop.json";
import ERC20Artifact from "../contracts/ERC20.json";
import ERC721Artifact from "../contracts/ERC721.json";
import { TicketInfo } from "./TicketInfoType";

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const pawnShopContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT,
      NFTPawnShopArtifact.abi,
      _provider
    );

const pawnLoansContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_PAWN_LOANS_CONTRACT,
      ERC721Artifact.abi,
      _provider
    );

const pawnTicketsContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PAWN_TICKETS_CONTRACT,
    ERC721Artifact.abi,
    _provider
  );

export async function getAllTicketIds() {
  const numberOfTickets = await pawnShopContract.totalSupply()

  const ticketsArray = (numberOfTickets): string[] => {
    var a: Array<string> = []
    for(var i = 1; i <= numberOfTickets; i++){
      a.push(i.toString())
    }
    return a
  }

  return ticketsArray(numberOfTickets).map(ticket => {
    return {
      params: {
        id: ticket
      }
    }
  })
}

export async function getTicketInfo(id: string) : Promise<TicketInfo> {
  const ticketInfo = await pawnShopContract.ticketInfo(ethers.BigNumber.from(id))
  const loanAsset = ticketInfo["loanAsset"] 
  const collateralAddress = ticketInfo["collateralAddress"]
  const collateralID = ticketInfo["collateralID"] 
  const perSecondInterestRate = ticketInfo["perSecondInterestRate"]
  const accumulatedInterest = ticketInfo["accumulatedInterest"]
  const lastAccumulatedTimestamp = ticketInfo["lastAccumulatedTimestamp"] 
  const durationSeconds = ticketInfo["durationSeconds"]
  const loanAmount = ticketInfo["loanAmount"]
  const collateralSeized = ticketInfo["collateralSeized"] 
  const closed = ticketInfo["closed"] 

  const assetContract = new ethers.Contract(
    loanAsset,
    ERC20Artifact.abi,
    _provider
  );
  
  const decimals = await assetContract.decimals()
  const loanAssetSymbol = await assetContract.symbol()
  var loanOwner = null 
  if(lastAccumulatedTimestamp != 0) {
    loanOwner = await pawnLoansContract.ownerOf(BigInt(id))
  }

  var interestOwed = await pawnShopContract.interestOwed(BigInt(id))
  const ticketOwner = await pawnTicketsContract.ownerOf(BigInt(id))


  return {
    ticketNumber: id,
    loanAsset: loanAsset,
    collateralAddress: collateralAddress,
    collateralID: collateralID, 
    perSecondInterestRate: perSecondInterestRate, 
    accumulatedInterest: accumulatedInterest, 
    lastAccumulatedTimestamp: lastAccumulatedTimestamp, 
    durationSeconds: durationSeconds,
    loanAmount: loanAmount,
    closed: closed,
    collateralSeized: collateralSeized,
    loanAssetDecimals: parseInt(decimals.toString()),
    loanAssetSymbol: loanAssetSymbol,
    loanOwner: loanOwner,
    ticketOwner: ticketOwner,
    interestOwed: interestOwed
  }
}