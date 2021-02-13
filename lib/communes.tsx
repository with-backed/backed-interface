import { ethers } from "ethers";
import CommuneArtifact from "../contracts/Commune.json";
import TokenArtifact from "../contracts/Token.json";

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const communeContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      _provider
    );

console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)


export async function getAllCommuneIDs() {
  const numberOfCommunes = await communeContract.numberOfCommunes()

  const communesArray = (numberOfCommunes): string[] => {
    var a: Array<string> = []
    for(var i = 1; i <= numberOfCommunes; i++){
      a.push(i.toString())
    }
    return a
  }

  return communesArray(numberOfCommunes).map(commune => {
    return {
      params: {
        id: commune
      }
    }
  })
}

export async function getCommuneData(id: string) {
  const communeData = await communeContract.getCommune(BigInt(id))
  const controller = communeData["controller"] //await communeContract.communeController(BigInt(id))
  const memberCount = communeData["memberCount"] //await communeContract.communeMemberCount(BigInt(id))
  const asset = communeData["asset"] //await communeContract.communeAsset(BigInt(id))
  const allowsJoining = communeData["allowsJoining"] //await communeContract.allowsJoining(BigInt(id))
  const allowsOutsideContribution = communeData["allowsOutsideContribution"]  // await communeContract.allowsOutsideContribution(BigInt(id))
  const allowsRemoving = communeData["allowsRemoving"] // await communeContract.allowsRemoving(BigInt(id))
  const proratedTotalAbsolute = communeData["proratedTotal"] // await communeContract.communeProratedTotal(BigInt(id))

  const assetContract = new ethers.Contract(
      asset,
      TokenArtifact.abi,
      _provider
    );
  const decimals = await assetContract.decimals()
  const proratedTotal = parseFloat(proratedTotalAbsolute.toString()) / Math.pow(10, decimals)

  const assetSymbol = await assetContract.symbol()



  // Combine the data with the id and contentHtml
  return {
    id: id, 
    controller: controller, 
    memberCount: memberCount.toNumber(),
    asset: asset, 
    allowsJoining: allowsJoining,
    allowsRemoving: allowsRemoving,
    allowsOutsideContribution: allowsOutsideContribution,
    proratedTotal: proratedTotal,
    assetDecimals: parseInt(decimals.toString()),
    assetSymbol: assetSymbol
  }
}