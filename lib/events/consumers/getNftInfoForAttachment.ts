import { SupportedNetwork } from 'lib/config';
import { getMedia } from 'lib/getNFTInfo';
import { NFTResponseData } from 'lib/getNFTInfo';

const JSON_PREFIX = 'data:application/json;base64,';

export async function getNFTInfoForAttachment(
  collateralContractAddress: string,
  collateralTokenId: string,
  siteUrl: string,
  network: SupportedNetwork,
): Promise<NFTResponseData> {
  let NFTInfo: NFTResponseData;

  const tokenURIRes = await fetch(
    `${siteUrl}/api/network/${network}/nftInfo/${collateralContractAddress}/${collateralTokenId}`,
  );
  NFTInfo = await tokenURIRes.json();

  return NFTInfo;
}
