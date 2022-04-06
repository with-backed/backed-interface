import { MessageAttachment, MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import sharp from 'sharp';

const SVG_PREFIX = 'data:image/svg+xml;base64,';
const JSON_PREFIX = 'data:application/json;base64,';

export async function collateralToDiscordMessageEmbed(
  nftResponseData: NFTResponseData,
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
): Promise<MessageEmbed | undefined> {
  let rawBufferAttachment: MessageAttachment | undefined = undefined;
  let messageEmbed: MessageEmbed;

  if (nftResponseData!.image.startsWith(SVG_PREFIX)) {
    const outputBuffer = await sharp(
      Buffer.from(
        nftResponseData!.image.substring(SVG_PREFIX.length),
        'base64',
      ),
    )
      .png()
      .toBuffer();

    rawBufferAttachment = new MessageAttachment(outputBuffer, `collateral.png`);
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .attachFiles([rawBufferAttachment])
      .setImage('attachment://collateral.png');
  } else {
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .setImage(nftResponseData!.image);
  }

  return messageEmbed;
}
