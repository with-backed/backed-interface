import { MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import { svg2png } from 'svg-png-converter';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function collateralToDiscordMessageEmbed(
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
  collateralTokenURI: string,
): Promise<MessageEmbed> {
  const isDataUri = collateralTokenURI.startsWith('data:');
  const tokenURIRes = await fetch(
    isDataUri
      ? collateralTokenURI
      : `https://rinkeby.withbacked.xyz/api/nftInfo/${encodeURIComponent(
          collateralTokenURI,
        )}`,
  );
  console.log({ tokenURIRes });
  const NFTInfo: NFTResponseData = await tokenURIRes.json();
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
