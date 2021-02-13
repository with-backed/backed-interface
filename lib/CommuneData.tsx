import { ethers } from "ethers";

export type CommuneData = {
  id: number,
  controller: string,
  memberCount: string, 
  asset: string, 
  allowsJoining: boolean, 
  allowsOutsideContribution: boolean, 
  allowsRemoving: boolean,
  communeContract: ethers.Contract,
  proratedTotal: number,
  assetDecimals: number,
  assetSymbol: string
}