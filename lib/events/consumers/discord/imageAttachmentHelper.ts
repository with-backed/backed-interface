import { MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { getNFTInfoFromTokenInfo } from 'lib/getNFTInfo';
import { svg2png } from 'svg-png-converter';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function collateralToDiscordMessageEmbed(
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
  collateralTokenURI: string,
): Promise<MessageEmbed> {
  const nftInfo = await getNFTInfoFromTokenInfo(
    collateralTokenId,
    collateralTokenURI,
    true,
  );

  if (nftInfo!.mediaUrl.startsWith(SVG_PREFIX)) {
    const outputBuffer = svg2png({
      input: nftInfo!.mediaUrl.substring(SVG_PREFIX.length + 2),
      encoding: 'base64',
      format: 'png',
    });
    console.log(outputBuffer);
  }

  return new MessageEmbed()
    .setTitle(`${collateralName} #${collateralTokenId}`)
    .setImage(nftInfo!.mediaUrl);
}
