import { MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import { svg2png } from 'svg-png-converter';

const SVG_PREFIX = 'data:image/svg+xml;base64,';
const JSON_PREFIX = 'data:application/json;base64,';

export async function collateralToDiscordMessageEmbed(
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
  collateralTokenURI: string,
): Promise<MessageEmbed> {
  let NFTInfo: NFTResponseData;

  const isDataUri = collateralTokenURI.startsWith('data:');

  if (isDataUri) {
    console.log({
      sub: collateralTokenURI.substring(
        collateralTokenURI.indexOf(JSON_PREFIX) + 2,
      ),
    });
    NFTInfo = JSON.parse(
      Buffer.from(
        collateralTokenURI.substring(
          collateralTokenURI.indexOf(JSON_PREFIX) + 2,
        ),
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

  console.log({ NFTInfo });

  if (NFTInfo!.image.startsWith(SVG_PREFIX)) {
    const outputBuffer = svg2png({
      input: NFTInfo!.image.substring(SVG_PREFIX.length + 2),
      encoding: 'base64',
      format: 'png',
    });
    console.log(outputBuffer);
  }

  return new MessageEmbed()
    .setTitle(`${collateralName} #${collateralTokenId}`)
    .setImage(NFTInfo!.image);
}
