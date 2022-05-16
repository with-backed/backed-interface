import { MessageAttachment, MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { NFTResponseData } from 'lib/getNFTInfo';
import { getPngBufferFromBase64SVG } from 'lib/events/consumers/attachmentsHelper';

const SVG_PREFIX = 'data:image/svg+xml;base64,';

export async function collateralToDiscordMessageEmbed(
  nftResponseData: NFTResponseData,
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
): Promise<MessageEmbed | undefined> {
  let rawBufferAttachment: MessageAttachment | undefined = undefined;
  let messageEmbed: MessageEmbed;

  if (nftResponseData?.image?.mediaUrl.startsWith(SVG_PREFIX)) {
    const pngBuffer = await getPngBufferFromBase64SVG(
      nftResponseData!.image!.mediaUrl,
    );

    rawBufferAttachment = new MessageAttachment(
      Buffer.from(pngBuffer, 'base64'),
      `collateral.png`,
    );
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .attachFiles([rawBufferAttachment])
      .setImage('attachment://collateral.png');
  } else {
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .setImage(nftResponseData!.image!.mediaUrl);
  }

  return messageEmbed;
}
