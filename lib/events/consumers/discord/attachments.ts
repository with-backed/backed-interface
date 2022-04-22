import { MessageAttachment, MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import nodeHtmlToImage from 'node-html-to-image';
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
    const pngBuffer = await nodeHtmlToImage({
      html: `<img src="${
        nftResponseData!.image
      }" width="100%" height="100%" />`,
      quality: 100,
      type: 'png',
      puppeteerArgs: {
        args: ['--no-sandbox'],
      },
      encoding: 'base64',
    });

    rawBufferAttachment = new MessageAttachment(
      pngBuffer as string,
      `collateral.png`,
    );
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
