import { NFTResponseData } from 'pages/api/nftInfo/[uri]';

const JSON_PREFIX = 'data:application/json;base64,';

export async function getNFTInfoForAttachment(
  collateralTokenURI: string,
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
  } else {
    const tokenURIRes = await fetch(
      isDataUri
        ? collateralTokenURI
        : `https://rinkeby.withbacked.xyz/api/nftInfo/${encodeURIComponent(
            collateralTokenURI,
          )}`,
    );
    NFTInfo = await tokenURIRes.json();
  }

  return NFTInfo;
}
