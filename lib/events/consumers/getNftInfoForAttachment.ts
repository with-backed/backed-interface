import { SupportedNetwork } from 'lib/config';
import { getMedia } from 'lib/getNFTInfo';
import { NFTResponseData } from 'lib/getNFTInfo';

const JSON_PREFIX = 'data:application/json;base64,';

export async function getNFTInfoForAttachment(
  collateralTokenURI: string,
  siteUrl: string,
  network: SupportedNetwork,
): Promise<NFTResponseData> {
  let NFTInfo: NFTResponseData;

  const isDataUri = collateralTokenURI.startsWith('data:');

  if (isDataUri) {
    NFTInfo = JSON.parse(
      Buffer.from(
        collateralTokenURI.substring(JSON_PREFIX.length),
        'base64',
      ).toString(),
    );

    // TODO: make this type safe. Since this is a data URI, it hasn't been
    // transformed the way the API does the non-data ones.
    Object.assign(NFTInfo, await getMedia(NFTInfo as any));
  } else {
    const tokenURIRes = await fetch(
      isDataUri
        ? collateralTokenURI
        : `${siteUrl}/api/network/${network}/nftInfo/${encodeURIComponent(
            collateralTokenURI,
          )}`,
    );
    NFTInfo = await tokenURIRes.json();
  }

  return NFTInfo;
}
